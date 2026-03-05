"use client";

import { FormEvent, useMemo, useState } from "react";
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

const newMedicine = (): MedicineDraft => ({
  id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  note: "",
});

export default function DoctorPatientPrescription() {
  const { doctor } = useDoctor();
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [followUpDays, setFollowUpDays] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<MedicineDraft[]>([newMedicine()]);
  const [submitMessage, setSubmitMessage] = useState("");

  const validMedicineCount = useMemo(
    () => medicines.filter((item) => item.medicine.trim()).length,
    [medicines]
  );

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

    setSubmitMessage("Prescription saved. Patient can now view it in Prescription screen.");
    setPatientName("");
    setPatientEmail("");
    setFollowUpDays("");
    setNotes("");
    setMedicines([newMedicine()]);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <header className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-5 text-white">
          <h1 className="text-2xl font-semibold">Patient Prescription</h1>
          <p className="mt-1 text-sm text-blue-50">
            Create prescription from doctor side and store it for patient view.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Patient Name</span>
              <input
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                placeholder="Enter patient name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Patient Email</span>
              <input
                value={patientEmail}
                onChange={(event) => setPatientEmail(event.target.value)}
                placeholder="Enter patient login email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Follow-up (days)</span>
              <input
                value={followUpDays}
                onChange={(event) => setFollowUpDays(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="e.g. 7"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-slate-700">Doctor</span>
              <input value={doctor.doctorName} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600" />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">General Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add advice or extra instructions"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Medicines</h2>
              <button
                type="button"
                onClick={addMedicine}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                + Add Medicine
              </button>
            </div>

            {medicines.map((item, index) => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Medicine {index + 1}</p>
                  {medicines.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeMedicine(item.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input value={item.medicine} onChange={(event) => updateMedicine(item.id, "medicine", event.target.value)} placeholder="Medicine name *" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  <input value={item.dosage} onChange={(event) => updateMedicine(item.id, "dosage", event.target.value)} placeholder="Dosage (e.g. 1 tablet)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  <input value={item.frequency} onChange={(event) => updateMedicine(item.id, "frequency", event.target.value)} placeholder="Frequency (e.g. Twice a day)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  <input value={item.duration} onChange={(event) => updateMedicine(item.id, "duration", event.target.value)} placeholder="Duration (e.g. 5 days)" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>

                <input
                  value={item.note}
                  onChange={(event) => updateMedicine(item.id, "note", event.target.value)}
                  placeholder="Medicine note (optional)"
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </article>
            ))}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-600">
              Ready medicines: <span className="font-semibold text-slate-900">{validMedicineCount}</span>
            </p>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Save Prescription
            </button>
          </footer>

          {submitMessage ? (
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {submitMessage}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
