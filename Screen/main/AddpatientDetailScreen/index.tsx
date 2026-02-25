"use client";

import { useState } from "react";
import Button from "@/Components/ui/Button";
import { useNavigate } from "@/utils";
import { usePatient } from "@/ContextApi/patientContext";

type PatientFormState = {
  fullName: string;
  age: string;
  gender: string;
  mobileNumber: string;
  weight: string;
  problem: string;
  relationship: string;
};

const relationshipOptions = ["Son", "Brother", "Sister", "Father", "Mother", "Spouse"];
const genderOptions = ["Male", "Female", "Other"];

type PatientFormErrors = Partial<Record<keyof PatientFormState, string>>;

export default function AddPatientDetailScreen() {
  const navigate = useNavigate();
  const { setPatientDetails } = usePatient();
  const [form, setForm] = useState<PatientFormState>({
    fullName: "",
    age: "",
    gender: "",
    mobileNumber: "",
    weight: "",
    problem: "",
    relationship: "",
  });
  const [errors, setErrors] = useState<PatientFormErrors>({});

  const onChangeField = (key: keyof PatientFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateForm = (data: PatientFormState): PatientFormErrors => {
    const nextErrors: PatientFormErrors = {};

    const name = data.fullName.trim();
    if (!name) nextErrors.fullName = "Full name is required.";
    else if (name.length < 2) nextErrors.fullName = "Full name must be at least 2 characters.";

    const age = Number(data.age);
    if (!data.age.trim()) nextErrors.age = "Age is required.";
    else if (!Number.isInteger(age) || age < 1 || age > 120) nextErrors.age = "Enter a valid age (1-120).";

    if (!data.gender.trim()) nextErrors.gender = "Gender is required.";
    else if (!genderOptions.includes(data.gender.trim()))
      nextErrors.gender = `Gender must be ${genderOptions.join(", ")}.`;

    const phone = data.mobileNumber.replace(/\D/g, "");
    if (!phone) nextErrors.mobileNumber = "Mobile number is required.";
    else if (phone.length !== 10) nextErrors.mobileNumber = "Mobile number must be 10 digits.";

    const weight = Number(data.weight);
    if (!data.weight.trim()) nextErrors.weight = "Weight is required.";
    else if (Number.isNaN(weight) || weight <= 0 || weight > 400) nextErrors.weight = "Enter valid weight (1-400 Kg).";

    const problem = data.problem.trim();
    if (!problem) nextErrors.problem = "Problem description is required.";
    else if (problem.length < 10) nextErrors.problem = "Please enter at least 10 characters.";

    if (!data.relationship.trim()) nextErrors.relationship = "Please select relationship.";

    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const sanitizedData = {
      ...form,
      fullName: form.fullName.trim(),
      gender: form.gender.trim(),
      mobileNumber: form.mobileNumber.replace(/\D/g, ""),
      age: form.age.trim(),
      weight: form.weight.trim(),
      problem: form.problem.trim(),
      relationship: form.relationship.trim(),
    };

    setPatientDetails(sanitizedData);
    navigate("/home/dashBoard/patientDeatail");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#dff5ff_0%,#f7fafc_35%,#f8fafc_100%)]">
      <section className="mx-auto w-full max-w-4xl px-4 py-7 md:px-6 md:py-10">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur sm:p-7">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Patient Details</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Fill in the details below to continue.</p>
          </div>

          <div className="space-y-5">
            <Field label="Full name" error={errors.fullName}>
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => onChangeField("fullName", event.target.value)}
                placeholder="Enter full name"
                className={`h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 ${
                  errors.fullName ? "border-rose-400 ring-2 ring-rose-100" : ""
                }`}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Age" error={errors.age}>
                <input
                  type="text"
                  value={form.age}
                  onChange={(event) => onChangeField("age", event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="22"
                  className={`h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 ${
                    errors.age ? "border-rose-400 ring-2 ring-rose-100" : ""
                  }`}
                />
              </Field>
              <Field label="Gender" error={errors.gender}>
                <select
                  value={form.gender}
                  onChange={(event) => onChangeField("gender", event.target.value)}
                  className={`h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 ${
                    errors.gender ? "border-rose-400 ring-2 ring-rose-100" : ""
                  }`}
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Mobile Number" error={errors.mobileNumber}>
              <input
                type="tel"
                value={form.mobileNumber}
                onChange={(event) => onChangeField("mobileNumber", event.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                placeholder="9999999999"
                className={`h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 ${
                  errors.mobileNumber ? "border-rose-400 ring-2 ring-rose-100" : ""
                }`}
              />
            </Field>

            <Field label="Weight" error={errors.weight}>
              <div className="relative">
                <input
                  type="text"
                  value={form.weight}
                  onChange={(event) => onChangeField("weight", event.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="50"
                  className={`h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 pr-14 text-base font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 ${
                    errors.weight ? "border-rose-400 ring-2 ring-rose-100" : ""
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Kg
                </span>
              </div>
            </Field>

            <Field label="Problem" error={errors.problem}>
              <textarea
                value={form.problem}
                onChange={(event) => onChangeField("problem", event.target.value)}
                rows={5}
                placeholder="Write something about your problem"
                className={`w-full resize-none rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 ${
                  errors.problem ? "border-rose-400 ring-2 ring-rose-100" : ""
                }`}
              />
            </Field>

            <Field label="" error={errors.relationship}>
              <select
                value={form.relationship}
                onChange={(event) => onChangeField("relationship", event.target.value)}
                className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 ${
                  errors.relationship ? "border-rose-400 ring-2 ring-rose-100" : ""
                }`}
              >
                <option value="">Relationship with Patient</option>
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Button
            type="button"
            onClick={handleSave}
            className="mt-9 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 py-3 text-lg font-semibold text-white shadow-[0_10px_25px_-10px_rgba(6,182,212,0.8)] hover:from-cyan-600 hover:to-sky-600"
          >
            Save
          </Button>
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
};

function Field({ label, children, error }: FieldProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-sm font-medium text-rose-600">{error}</span>}
    </label>
  );
}
