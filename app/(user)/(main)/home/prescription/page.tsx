"use client";

import { CalendarDays, FileText, Pill } from "lucide-react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useDoctor } from "@/ContextApi/doctorContext";

type DoctorStorageItem = {
  name: string;
  specialty: string;
  doctorSignature?: string;
  doctorStamp?: string;
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
  patientEmail?: string;
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
  const doctorSignature = typeof value.doctorSignature === "string" && value.doctorSignature.trim()
    ? value.doctorSignature.trim()
    : typeof value.signature === "string" && value.signature.trim()
      ? value.signature.trim()
      : undefined;
  const doctorStamp = typeof value.doctorStamp === "string" && value.doctorStamp.trim()
    ? value.doctorStamp.trim()
    : typeof value.stamp === "string" && value.stamp.trim()
      ? value.stamp.trim()
      : undefined;
  return { name, specialty, doctorSignature, doctorStamp };
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
  const patientEmail = typeof value.patientEmail === "string" && value.patientEmail.trim()
    ? value.patientEmail.trim().toLowerCase()
    : undefined;
  const notes = typeof value.notes === "string" && value.notes.trim() ? value.notes.trim() : undefined;

  return {
    id,
    doctorName,
    doctorSpecialty,
    issuedOn,
    patientEmail,
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
  window.addEventListener("mock-auth-changed", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("focus", handler);
    window.removeEventListener("mock-auth-changed", handler);
  };
}

function getServerSnapshot(): PrescriptionSnapshot {
  return EMPTY_SNAPSHOT;
}

function getCurrentUserEmailSnapshot() {
  if (typeof window === "undefined") return "";

  try {
    const sessionRaw = window.localStorage.getItem("mock_auth_session");
    const usersRaw = window.localStorage.getItem("mock_auth_users");
    if (!sessionRaw || !usersRaw) return "";

    const session = JSON.parse(sessionRaw) as { userId?: string | null };
    const users = JSON.parse(usersRaw) as Array<{ id?: string; email?: string }>;
    if (!session?.userId || !Array.isArray(users)) return "";

    const matchedUser = users.find((item) => item?.id === session.userId);
    return typeof matchedUser?.email === "string" ? matchedUser.email.trim().toLowerCase() : "";
  } catch {
    return "";
  }
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function PrescriptionPage() {
  const { doctor } = useDoctor();
  const [downloadError, setDownloadError] = useState("");
  const snapshot = useSyncExternalStore(subscribeStorage, getStorageSnapshot, getServerSnapshot);
  const currentUserEmail = useSyncExternalStore(
    subscribeStorage,
    getCurrentUserEmailSnapshot,
    () => ""
  );

  const latestPrescription = useMemo(() => {
    const doctorName = normalize(doctor.doctorName);
    const doctorSpecialty = normalize(doctor.specialist);
    const loggedInEmail = normalize(currentUserEmail);

    const userMatched = snapshot.prescriptions.filter((item) =>
      loggedInEmail ? normalize(item.patientEmail) === loggedInEmail : !item.patientEmail
    );

    if (!userMatched.length) return null;

    const doctorMatched = userMatched.filter((item) => {
      const matchesName = normalize(item.doctorName) === doctorName;
      if (!matchesName) return false;
      if (!doctorSpecialty) return true;
      return normalize(item.doctorSpecialty) === doctorSpecialty;
    });

    return doctorMatched[0] ?? userMatched[0] ?? null;
  }, [currentUserEmail, doctor.doctorName, doctor.specialist, snapshot.prescriptions]);

  const doctorLine = latestPrescription
    ? `${latestPrescription.doctorName} | ${latestPrescription.doctorSpecialty}`
    : doctor.doctorName || snapshot.doctors[0]?.name || "Doctor";

  const prescriptionDoctor = useMemo(() => {
    if (!latestPrescription) return null;

    const exactMatch = snapshot.doctors.find(
      (item) =>
        normalize(item.name) === normalize(latestPrescription.doctorName) &&
        normalize(item.specialty) === normalize(latestPrescription.doctorSpecialty)
    );
    if (exactMatch) return exactMatch;

    return snapshot.doctors.find(
      (item) => normalize(item.name) === normalize(latestPrescription.doctorName)
    ) ?? null;
  }, [latestPrescription, snapshot.doctors]);

  const handleDownloadPrescription = useCallback(() => {
    if (!latestPrescription || typeof window === "undefined") return;
    setDownloadError("");
    if (!prescriptionDoctor?.doctorSignature || !prescriptionDoctor?.doctorStamp) {
      window.alert("You need to add first signature and stamp.");
      return;
    }

    const signatureHtml = prescriptionDoctor?.doctorSignature
      ? `<div class="auth-card"><p class="auth-title">Doctor Signature</p><img src="${escapeHtml(prescriptionDoctor.doctorSignature)}" alt="Doctor signature" /></div>`
      : "";
    const stampHtml = prescriptionDoctor?.doctorStamp
      ? `<div class="auth-card"><p class="auth-title">Clinic Stamp</p><img src="${escapeHtml(prescriptionDoctor.doctorStamp)}" alt="Clinic stamp" /></div>`
      : "";

    const medicinesHtml = latestPrescription.medicines.map((item, index) => {
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.medicine)}</td>
          <td>${escapeHtml(item.dosage)}</td>
          <td>${escapeHtml(item.frequency)}</td>
          <td>${escapeHtml(item.duration)}</td>
          <td>${escapeHtml(item.note ?? "-")}</td>
        </tr>
      `;
    }).join("");

    const notesHtml = latestPrescription.notes
      ? `<p class="notes">${escapeHtml(latestPrescription.notes)}</p>`
      : "";

    const followUpHtml = latestPrescription.followUpDays
      ? `<p class="follow-up">Follow-up in ${latestPrescription.followUpDays} day(s)</p>`
      : "";

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
            .header { border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 24px; font-weight: 700; margin: 0 0 6px; }
            .meta { color: #475569; font-size: 14px; margin: 0; }
            .follow-up { margin: 10px 0; color: #166534; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 13px; text-align: left; vertical-align: top; }
            th { background: #f1f5f9; }
            .notes { margin-top: 14px; padding: 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 13px; }
            .auth-wrap { display: flex; gap: 12px; margin-top: 18px; }
            .auth-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; width: 220px; }
            .auth-title { margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; }
            .auth-card img { max-width: 100%; max-height: 90px; object-fit: contain; display: block; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Prescription</h1>
            <p class="meta">${escapeHtml(doctorLine)} | Issued on ${escapeHtml(formatIssuedOn(latestPrescription.issuedOn))}</p>
            ${followUpHtml}
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${medicinesHtml}
            </tbody>
          </table>

          ${notesHtml}
          <div class="auth-wrap">
            ${signatureHtml}
            ${stampHtml}
          </div>
        </body>
      </html>
    `;

    const frame = window.document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");
    window.document.body.appendChild(frame);

    const frameDoc = frame.contentDocument;
    const frameWindow = frame.contentWindow;
    if (frameDoc && frameWindow) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();
      window.setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();
        window.setTimeout(() => {
          if (frame.parentNode) {
            frame.parentNode.removeChild(frame);
          }
        }, 1200);
      }, 300);
      return;
    }

    if (frame.parentNode) {
      frame.parentNode.removeChild(frame);
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
    if (!printWindow) {
      setDownloadError("Popup blocked. Please allow popups, then try again.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  }, [doctorLine, latestPrescription, prescriptionDoctor]);

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
          {latestPrescription ? (
            <div className="self-start">
              <button
                type="button"
                onClick={handleDownloadPrescription}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Download Prescription PDF
              </button>
              {downloadError ? (
                <p className="mt-1 text-xs font-medium text-rose-600">{downloadError}</p>
              ) : null}
            </div>
          ) : null}
        </header>

        {!latestPrescription ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">
              No prescription shared for this user yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Login email: <code>{currentUserEmail || "not found"}</code>
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

            {(prescriptionDoctor?.doctorSignature || prescriptionDoctor?.doctorStamp) ? (
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {prescriptionDoctor?.doctorSignature ? (
                  <article className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor Signature</p>
                    <Image
                      src={prescriptionDoctor.doctorSignature}
                      alt="Doctor signature"
                      width={240}
                      height={80}
                      className="h-20 w-auto max-w-full object-contain"
                    />
                  </article>
                ) : null}
                {prescriptionDoctor?.doctorStamp ? (
                  <article className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Clinic Stamp</p>
                    <Image
                      src={prescriptionDoctor.doctorStamp}
                      alt="Clinic stamp"
                      width={240}
                      height={80}
                      className="h-20 w-auto max-w-full object-contain"
                    />
                  </article>
                ) : null}
              </section>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
