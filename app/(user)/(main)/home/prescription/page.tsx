"use client";

import { CalendarDays, FileText, Pill } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import { useDoctor } from "@/ContextApi/doctorContext";

type DoctorStorageItem = {
  name: string;
  specialty: string;
};

type PrescriptionMedicine = {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  note?: string;
};

type PrescriptionStorageItem = {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  issuedOn: string;
  followUpDays?: number;
  notes?: string;
  medicines: PrescriptionMedicine[];
};

type PrescriptionSnapshot = {
  doctors: DoctorStorageItem[];
  prescriptions: PrescriptionStorageItem[];
};

const EMPTY_SNAPSHOT: PrescriptionSnapshot = {
  doctors: [],
  prescriptions: [],
};
let cachedDoctorsRaw: string | null | undefined;
let cachedPrescriptionsRaw: string | null | undefined;
let cachedSnapshot: PrescriptionSnapshot = EMPTY_SNAPSHOT;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalize(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toDoctorStorageItem(value: unknown): DoctorStorageItem | null {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const specialty = typeof value.specialty === "string" ? value.specialty.trim() : "";
  if (!name || !specialty) return null;
  return { name, specialty };
}

function toPrescriptionMedicine(value: unknown, index: number): PrescriptionMedicine | null {
  if (!isRecord(value)) return null;
  const medicine = typeof value.medicine === "string" ? value.medicine.trim() : "";
  if (!medicine) return null;

  const id = typeof value.id === "string" && value.id.trim() ? value.id : `med-${index + 1}`;
  const dosage = typeof value.dosage === "string" ? value.dosage.trim() : "-";
  const frequency = typeof value.frequency === "string" ? value.frequency.trim() : "-";
  const duration = typeof value.duration === "string" ? value.duration.trim() : "-";
  const note = typeof value.note === "string" && value.note.trim() ? value.note.trim() : undefined;

  return {
    id,
    medicine,
    dosage,
    frequency,
    duration,
    note,
  };
}

function toPrescriptionStorageItem(value: unknown, index: number): PrescriptionStorageItem | null {
  if (!isRecord(value)) return null;

  const doctorName = typeof value.doctorName === "string" ? value.doctorName.trim() : "";
  const doctorSpecialty = typeof value.doctorSpecialty === "string" ? value.doctorSpecialty.trim() : "";
  if (!doctorName || !doctorSpecialty) return null;

  const medicines = Array.isArray(value.medicines)
    ? value.medicines
        .map((item, medicineIndex) => toPrescriptionMedicine(item, medicineIndex))
        .filter((item): item is PrescriptionMedicine => item !== null)
    : [];
  if (!medicines.length) return null;

  const id = typeof value.id === "string" && value.id.trim() ? value.id : `rx-${index + 1}`;
  const issuedOn = typeof value.issuedOn === "string" && value.issuedOn.trim()
    ? value.issuedOn
    : new Date().toISOString();
  const followUpDays = typeof value.followUpDays === "number" && value.followUpDays > 0
    ? value.followUpDays
    : undefined;
  const notes = typeof value.notes === "string" && value.notes.trim() ? value.notes.trim() : undefined;

  return {
    id,
    doctorName,
    doctorSpecialty,
    issuedOn,
    followUpDays,
    notes,
    medicines,
  };
}

function getStorageSnapshot(): PrescriptionSnapshot {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;

  const doctorsRaw = window.localStorage.getItem("doctor_data");
  const prescriptionsRaw = window.localStorage.getItem("doctor_prescriptions");
  if (doctorsRaw === cachedDoctorsRaw && prescriptionsRaw === cachedPrescriptionsRaw) {
    return cachedSnapshot;
  }

  let doctors: DoctorStorageItem[] = [];
  let prescriptions: PrescriptionStorageItem[] = [];

  if (doctorsRaw) {
    try {
      const parsed = JSON.parse(doctorsRaw);
      if (Array.isArray(parsed)) {
        doctors = parsed
          .map((item) => toDoctorStorageItem(item))
          .filter((item): item is DoctorStorageItem => item !== null);
      }
    } catch {
      doctors = [];
    }
  }

  if (prescriptionsRaw) {
    try {
      const parsed = JSON.parse(prescriptionsRaw);
      if (Array.isArray(parsed)) {
        prescriptions = parsed
          .map((item, index) => toPrescriptionStorageItem(item, index))
          .filter((item): item is PrescriptionStorageItem => item !== null)
          .sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime());
      }
    } catch {
      prescriptions = [];
    }
  }

  cachedDoctorsRaw = doctorsRaw;
  cachedPrescriptionsRaw = prescriptionsRaw;
  cachedSnapshot = { doctors, prescriptions };

  return cachedSnapshot;
}

function subscribeStorage(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener("focus", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
  };
}

function getServerSnapshot(): PrescriptionSnapshot {
  return EMPTY_SNAPSHOT;
}

function formatIssuedOn(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function PrescriptionPage() {
  const { doctor } = useDoctor();
  const snapshot = useSyncExternalStore(subscribeStorage, getStorageSnapshot, getServerSnapshot);

  const latestPrescription = useMemo(() => {
    const doctorName = normalize(doctor.doctorName);
    const doctorSpecialty = normalize(doctor.specialist);

    const matched = snapshot.prescriptions.filter((item) => {
      const matchesName = normalize(item.doctorName) === doctorName;
      if (!matchesName) return false;
      if (!doctorSpecialty) return true;
      return normalize(item.doctorSpecialty) === doctorSpecialty;
    });

    return matched[0] ?? snapshot.prescriptions[0] ?? null;
  }, [doctor.doctorName, doctor.specialist, snapshot.prescriptions]);

  const doctorLine = latestPrescription
    ? `${latestPrescription.doctorName} | ${latestPrescription.doctorSpecialty}`
    : doctor.doctorName || snapshot.doctors[0]?.name || "Doctor";

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-5xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Prescription</h1>
            <p className="mt-1 text-sm text-slate-600">
              {latestPrescription ? `${doctorLine} | Issued on ${formatIssuedOn(latestPrescription.issuedOn)}` : doctorLine}
            </p>
          </div>
          {latestPrescription?.followUpDays ? (
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <CalendarDays className="h-4 w-4" />
              Follow-up in {latestPrescription.followUpDays} days
            </div>
          ) : null}
        </header>

        {!latestPrescription ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">
              No prescription has been shared from doctor frontend yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Expected storage key: <code>doctor_prescriptions</code>
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {latestPrescription.medicines.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <Pill className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-900">{item.medicine}</h2>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-3">
                        <p>
                          <span className="font-medium text-slate-700">Dosage:</span> {item.dosage}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Frequency:</span> {item.frequency}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Duration:</span> {item.duration}
                        </p>
                      </div>
                      {item.note ? (
                        <p className="mt-2 text-sm text-amber-700">
                          <span className="font-medium">Note:</span> {item.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {latestPrescription.notes ? (
              <footer className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-2 text-slate-700">
                  <FileText className="mt-0.5 h-4 w-4" />
                  <p className="text-sm leading-6">{latestPrescription.notes}</p>
                </div>
              </footer>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
