"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDoctor } from "@/ContextApi/DoctorProfileContext";

type MedicineDraft = {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  note: string;
};

type SavedPrescription = {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  issuedOn: string;
  patientName?: string;
  patientEmail?: string;
  followUpDays?: number;
  notes?: string;
  medicines: Array<{
    id: string;
    medicine: string;
    dosage: string;
    frequency: string;
    duration: string;
    note?: string;
  }>;
};

type StoredPatient = {
  id: string;
  fullname: string;
  email: string;
  number: string;
  avatarSrc: string;
};

const newMedicine = (): MedicineDraft => ({
  id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  note: "",
});

function getInitials(name: string) {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return "PT";
  return tokens
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? "")
    .join("");
}

function hashValue(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createPatientAvatar(name: string) {
  const source = name.trim() || "Patient";
  const initials = getInitials(source);
  const seed = hashValue(source);
  const hueA = seed % 360;
  const hueB = (seed + 60) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='hsl(${hueA},75%,58%)'/>
        <stop offset='100%' stop-color='hsl(${hueB},72%,46%)'/>
      </linearGradient>
    </defs>
    <rect width='96' height='96' rx='24' fill='url(#g)'/>
    <text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Segoe UI, Arial, sans-serif' font-weight='700' font-size='34'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getStoredPatients(doctorEmail: string) {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem("mock_auth_users");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<{
      id?: string;
      fullname?: string;
      email?: string;
      number?: string;
    }>;

    if (!Array.isArray(parsed)) return [];

    const normalizedDoctorEmail = doctorEmail.trim().toLowerCase();

    return parsed
      .map((item) => ({
        id: String(item?.id ?? ""),
        fullname: String(item?.fullname ?? "").trim(),
        email: String(item?.email ?? "").trim().toLowerCase(),
        number: String(item?.number ?? "").trim(),
        avatarSrc: createPatientAvatar(String(item?.fullname ?? "").trim()),
      }))
      .filter((item) => item.id && item.fullname && item.email)
      .filter((item) => item.email !== normalizedDoctorEmail);
  } catch {
    return [];
  }
}

function getSavedPrescriptions(doctorName: string) {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem("doctor_prescriptions");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as SavedPrescription[];
    if (!Array.isArray(parsed)) return [];

    const normalizedDoctorName = doctorName.trim().toLowerCase();
    return parsed
      .filter((item) => item && typeof item === "object")
      .filter((item) => (item.doctorName ?? "").trim().toLowerCase() === normalizedDoctorName)
      .sort((a, b) => {
        const at = new Date(a.issuedOn ?? 0).getTime();
        const bt = new Date(b.issuedOn ?? 0).getTime();
        return bt - at;
      });
  } catch {
    return [];
  }
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export default function DoctorPatientPrescription() {
  const { doctor } = useDoctor();
  const [patients, setPatients] = useState<StoredPatient[]>([]);
  const [searchText, setSearchText] = useState("");
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [followUpDays, setFollowUpDays] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<MedicineDraft[]>([newMedicine()]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [savedPrescriptions, setSavedPrescriptions] = useState<SavedPrescription[]>([]);

  const validMedicineCount = useMemo(
    () => medicines.filter((item) => item.medicine.trim()).length,
    [medicines]
  );

  useEffect(() => {
    const loadPatients = () => {
      setPatients(getStoredPatients(doctor.doctorEmail));
    };

    loadPatients();
    window.addEventListener("storage", loadPatients);
    window.addEventListener("mock-auth-changed", loadPatients as EventListener);

    return () => {
      window.removeEventListener("storage", loadPatients);
      window.removeEventListener("mock-auth-changed", loadPatients as EventListener);
    };
  }, [doctor.doctorEmail]);

  useEffect(() => {
    const loadPrescriptions = () => {
      setSavedPrescriptions(getSavedPrescriptions(doctor.doctorName));
    };

    loadPrescriptions();
    window.addEventListener("storage", loadPrescriptions);

    return () => {
      window.removeEventListener("storage", loadPrescriptions);
    };
  }, [doctor.doctorName]);

  const filteredPatients = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return patients;

    return patients.filter((item) => {
      const searchPool = `${item.fullname} ${item.email} ${item.number}`.toLowerCase();
      return searchPool.includes(query);
    });
  }, [patients, searchText]);

  const visiblePatients = useMemo(
    () => (showAllPatients ? filteredPatients : filteredPatients.slice(0, 6)),
    [filteredPatients, showAllPatients]
  );
  const isDoctorProfileComplete = useMemo(() => {
    const hasCoreProfile =
      doctor.doctorName.trim() &&
      doctor.specialist.trim() &&
      doctor.doctorEmail.trim() &&
      doctor.clinicLocation.trim();
    const hasVerificationAssets = doctor.doctorSignature.trim() && doctor.doctorStamp.trim();
    return Boolean(hasCoreProfile && hasVerificationAssets);
  }, [
    doctor.clinicLocation,
    doctor.doctorEmail,
    doctor.doctorName,
    doctor.doctorSignature,
    doctor.doctorStamp,
    doctor.specialist,
  ]);

  const updateMedicine = (id: string, field: keyof MedicineDraft, value: string) => {
    setMedicines((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeMedicine = (id: string) => {
    setMedicines((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const addMedicine = () => setMedicines((prev) => [...prev, newMedicine()]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const doctorName = doctor.doctorName.trim();
    const doctorSpecialty = doctor.specialist.trim();

    const finalMedicines = medicines
      .map((item) => ({
        id: item.id,
        medicine: item.medicine.trim(),
        dosage: item.dosage.trim() || "-",
        frequency: item.frequency.trim() || "-",
        duration: item.duration.trim() || "-",
        note: item.note.trim() || undefined,
      }))
      .filter((item) => item.medicine);
    const normalizedPatientEmail = patientEmail.trim().toLowerCase();
    const hasValidPatientEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedPatientEmail);

    if (!doctorName || !doctorSpecialty) {
      setSubmitMessage("Please complete doctor profile name and specialty first.");
      return;
    }

    if (!finalMedicines.length) {
      setSubmitMessage("Add at least one medicine name before saving.");
      return;
    }
    if (!hasValidPatientEmail) {
      setSubmitMessage("Enter a valid patient email so prescription is visible to that user only.");
      return;
    }

    const payload: SavedPrescription = {
      id: `rx-${Date.now()}`,
      doctorName,
      doctorSpecialty,
      issuedOn: new Date().toISOString(),
      patientName: patientName.trim() || undefined,
      patientEmail: normalizedPatientEmail,
      followUpDays: Number(followUpDays) > 0 ? Number(followUpDays) : undefined,
      notes: notes.trim() || undefined,
      medicines: finalMedicines,
    };

    const raw = window.localStorage.getItem("doctor_prescriptions");
    let parsed: unknown = [];

    try {
      parsed = raw ? JSON.parse(raw) : [];
    } catch {
      parsed = [];
    }

    const existing = Array.isArray(parsed) ? parsed : [];
    const updated = [payload, ...existing];
    window.localStorage.setItem("doctor_prescriptions", JSON.stringify(updated));
    setSavedPrescriptions(getSavedPrescriptions(doctor.doctorName));

    setSubmitMessage("Prescription saved. Patient can now view it in Prescription screen.");
    setPatientName("");
    setPatientEmail("");
    setFollowUpDays("");
    setNotes("");
    setMedicines([newMedicine()]);
  };

  const handleCreatePrescription = (patient: StoredPatient) => {
    if (!isDoctorProfileComplete) {
      window.alert("First, you need to complete your profile.");
      return;
    }

    setPatientName(patient.fullname);
    setPatientEmail(patient.email);
    setSubmitMessage("");
    setIsFormOpen(true);
    setSelectedPatientId(patient.id);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0%,_#f8fafc_36%,_#f1f5f9_100%)] p-4 md:p-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-3xl border border-sky-200/70 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 p-6 text-white shadow-[0_20px_45px_-24px_rgba(2,132,199,0.75)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">Doctor Workspace</p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">Patient Prescription</h1>
          <p className="mt-1 text-sm text-sky-50">Search patients, select one card, and issue a prescription quickly.</p>
        </header>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)] md:p-5">
          {!isDoctorProfileComplete ? (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              First you need to complete your profile (including signature and stamp) before creating prescriptions.
            </p>
          ) : null}
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">Patient List</h2>
              <p className="text-sm text-slate-500">Search by patient name, email, or mobile number.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                Total: {filteredPatients.length}
              </span>
              <button
                type="button"
                onClick={() => setShowAllPatients((prev) => !prev)}
                className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {showAllPatients ? "Show Top" : "Show All"}
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by name, email, or mobile"
              className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-sky-500"
            />
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <path d="m21 20.3-4.35-4.35a7.3 7.3 0 1 0-.71.7L20.3 21zM4.7 10.7a6 6 0 1 1 12 0 6 6 0 0 1-12 0z" fill="currentColor" />
            </svg>
          </div>

          {visiblePatients.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
              No patient found for current search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visiblePatients.map((patient) => (
                <article
                  key={patient.id}
                  className={`rounded-2xl border bg-white p-3.5 transition ${
                    selectedPatientId === patient.id
                      ? "border-sky-300 shadow-[0_12px_28px_-24px_rgba(14,165,233,0.85)]"
                      : "border-slate-200 hover:border-sky-200 hover:shadow-[0_10px_24px_-22px_rgba(15,23,42,0.5)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={patient.avatarSrc}
                      alt={`${patient.fullname} avatar`}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{patient.fullname}</p>
                      <p className="truncate text-xs text-slate-500">{patient.email}</p>
                      {patient.number ? <p className="truncate text-xs text-slate-400">{patient.number}</p> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreatePrescription(patient)}
                    className="mt-3 w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={!isDoctorProfileComplete}
                  >
                    Create Prescription
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-600">
          {isFormOpen ? (
            <>
              Prescription form window is open. Complete details and save.
            </>
          ) : (
            <>
              Select a patient card and click <span className="font-semibold text-slate-900">Create Prescription</span> to open the form window.
            </>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.55)] md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900 md:text-xl">All Prescriptions</h2>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {savedPrescriptions.length} total
            </span>
          </div>

          {savedPrescriptions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
              No prescriptions saved yet.
            </p>
          ) : (
            <div className="space-y-3">
              {savedPrescriptions.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.patientName || "Patient"} <span className="text-slate-500">({item.patientEmail || "No email"})</span>
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {formatDateTime(item.issuedOn)}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-slate-700">
                      Medicines: {item.medicines?.length ?? 0}
                    </span>
                    <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-slate-700">
                      Follow-up: {item.followUpDays ? `${item.followUpDays} days` : "Not set"}
                    </span>
                  </div>
                  {item.notes ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {item.notes}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm md:p-6">
          <section className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_70px_-32px_rgba(2,132,199,0.65)]">
            <header className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 px-4 py-4 md:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Prescription Window</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Create Prescription</h2>
                  <p className="mt-1 text-sm text-slate-600">Quick, clear form for writing medicines and notes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="space-y-5 overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Doctor: <span className="font-semibold text-slate-800">{doctor.doctorName || "Not set"}</span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Ready Medicines: <span className="font-semibold text-slate-800">{validMedicineCount}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Patient Details</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Patient Name</span>
                      <input
                        value={patientName}
                        onChange={(event) => setPatientName(event.target.value)}
                        placeholder="Enter patient name"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Patient Email</span>
                      <input
                        value={patientEmail}
                        onChange={(event) => setPatientEmail(event.target.value)}
                        placeholder="Enter patient login email"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Follow-up (days)</span>
                      <input
                        value={followUpDays}
                        onChange={(event) => setFollowUpDays(event.target.value.replace(/[^\d]/g, ""))}
                        placeholder="e.g. 7"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Doctor</span>
                      <input
                        value={doctor.doctorName}
                        readOnly
                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">General Notes</span>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={3}
                      placeholder="Add advice or extra instructions"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500"
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Medicines</h3>
                    <button
                      type="button"
                      onClick={addMedicine}
                      className="rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-3">
                    {medicines.map((item, index) => (
                      <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-700">Medicine {index + 1}</p>
                          {medicines.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeMedicine(item.id)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <input value={item.medicine} onChange={(event) => updateMedicine(item.id, "medicine", event.target.value)} placeholder="Medicine name *" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500" />
                          <input value={item.dosage} onChange={(event) => updateMedicine(item.id, "dosage", event.target.value)} placeholder="Dosage (e.g. 1 tablet)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500" />
                          <input value={item.frequency} onChange={(event) => updateMedicine(item.id, "frequency", event.target.value)} placeholder="Frequency (e.g. Twice a day)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500" />
                          <input value={item.duration} onChange={(event) => updateMedicine(item.id, "duration", event.target.value)} placeholder="Duration (e.g. 5 days)" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500" />
                        </div>

                        <input
                          value={item.note}
                          onChange={(event) => updateMedicine(item.id, "note", event.target.value)}
                          placeholder="Medicine note (optional)"
                          className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
                        />
                      </article>
                    ))}
                  </div>
                </div>

                {submitMessage ? (
                  <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-700">
                    {submitMessage}
                  </p>
                ) : null}
              </div>

              <footer className="border-t border-slate-200 bg-white px-4 py-3 md:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">
                    Ready medicines: <span className="font-semibold text-slate-900">{validMedicineCount}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                    >
                      Save Prescription
                    </button>
                  </div>
                </div>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
