"use client";

import { useState } from "react";
import Button from "@/Components/ui/Button";

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

export default function AddPatientDetailScreen() {
  const [form, setForm] = useState<PatientFormState>({
    fullName: "Sudharkar Murti",
    age: "22",
    gender: "Male",
    mobileNumber: "9999999900",
    weight: "50",
    problem: "write something about your problem",
    relationship: "",
  });

  const onChangeField = (key: keyof PatientFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Placeholder for API integration.
    console.log("Patient detail saved", form);
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <section className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="space-y-4">
            <Field label="Full name">
              <input
                type="text"
                value={form.fullName}
                onChange={(event) => onChangeField("fullName", event.target.value)}
                className="h-12 w-full rounded-xl bg-slate-100 px-4 text-lg font-semibold text-slate-900 outline-none ring-1 ring-transparent focus:ring-cyan-500"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Age">
                <input
                  type="text"
                  value={form.age}
                  onChange={(event) => onChangeField("age", event.target.value)}
                  className="h-12 w-full rounded-xl bg-slate-100 px-4 text-lg font-semibold text-slate-900 outline-none ring-1 ring-transparent focus:ring-cyan-500"
                />
              </Field>
              <Field label="Gender">
                <input
                  type="text"
                  value={form.gender}
                  onChange={(event) => onChangeField("gender", event.target.value)}
                  className="h-12 w-full rounded-xl bg-slate-100 px-4 text-lg font-semibold text-slate-900 outline-none ring-1 ring-transparent focus:ring-cyan-500"
                />
              </Field>
            </div>

            <Field label="Mobile Number">
              <input
                type="tel"
                value={form.mobileNumber}
                onChange={(event) => onChangeField("mobileNumber", event.target.value)}
                className="h-12 w-full rounded-xl bg-slate-100 px-4 text-lg font-semibold text-slate-900 outline-none ring-1 ring-transparent focus:ring-cyan-500"
              />
            </Field>

            <Field label="Weight">
              <div className="relative">
                <input
                  type="text"
                  value={form.weight}
                  onChange={(event) => onChangeField("weight", event.target.value)}
                  className="h-12 w-full rounded-xl bg-slate-100 px-4 pr-12 text-lg font-semibold text-slate-900 outline-none ring-1 ring-transparent focus:ring-cyan-500"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-slate-500">
                  Kg
                </span>
              </div>
            </Field>

            <Field label="Problem">
              <textarea
                value={form.problem}
                onChange={(event) => onChangeField("problem", event.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl bg-slate-100 px-4 py-3 text-lg font-semibold text-slate-900 outline-none ring-1 ring-transparent focus:ring-cyan-500"
              />
            </Field>

            <Field label="">
              <select
                value={form.relationship}
                onChange={(event) => onChangeField("relationship", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-lg font-semibold text-slate-900 outline-none ring-1 ring-transparent focus:ring-cyan-500"
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
            className="mt-10 w-full rounded-xl bg-cyan-500 py-3 text-xl font-semibold text-white hover:bg-cyan-600"
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
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-xl font-medium text-slate-500">{label}</span>}
      {children}
    </label>
  );
}
