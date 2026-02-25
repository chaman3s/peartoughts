"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/Components/ui/Button";
import { useNavigate } from "@/utils";
import { usePatient } from "@/ContextApi/patientContext";

const visitTypeOptions = ["First", "Report", "Follow-up"];

export default function PatientDetailPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { patientDetails } = usePatient();
  const [visitType, setVisitType] = useState("");

  if (!patientDetails) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d8f6ff_0%,#f5f8fb_45%,#f8fafc_100%)]">
        <section className="mx-auto w-full max-w-2xl px-4 py-8">
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.5)] backdrop-blur">
            <h1 className="text-2xl font-semibold text-slate-900">Patient Details</h1>
            <p className="mt-3 text-slate-600">No patient details found. Please add patient details first.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d8f6ff_0%,#f5f8fb_45%,#f8fafc_100%)]">
      <section className="mx-auto w-full max-w-2xl px-4 py-6 md:py-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M15.5 19 8.5 12l7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-600">Consultation</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Details</h1>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-5 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.5)] backdrop-blur sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-100/70 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Full name</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{patientDetails.fullName}</p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Age</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{patientDetails.age}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Weight</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{patientDetails.weight}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Relation</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{patientDetails.relationship}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Problem</p>
            <p className="mt-1 text-lg font-semibold leading-snug text-slate-900">{patientDetails.problem}</p>
          </div>

          <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mobile</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{patientDetails.mobileNumber}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/80 bg-white/95 p-0 shadow-[0_15px_40px_-30px_rgba(15,23,42,0.45)]">
          <select
            value={visitType}
            onChange={(event) => setVisitType(event.target.value)}
            className="h-14 w-full rounded-2xl bg-white px-4 text-lg font-semibold text-slate-800 outline-none"
          >
            <option value="">Visit Type</option>
            {visitTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-4">
          <p className="text-xl font-semibold text-slate-900">Payment</p>
          <p className="mt-1 text-sm text-slate-500">
            Reduce your waiting time by paying the consulting fee upfront.
          </p>
        </div>

        <Button
          type="button"
          className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 py-3 text-lg font-semibold text-white shadow-[0_14px_30px_-16px_rgba(6,182,212,0.85)] hover:from-cyan-600 hover:to-sky-600"
        >
          Pay Consulting Fee
        </Button>

        <Button
          type="button"
          className="mt-4 w-full rounded-2xl border border-cyan-300 bg-white py-3 text-lg font-semibold text-cyan-600 hover:bg-cyan-50"
        >
          Quick query
        </Button>
      </section>
    </main>
  );
}
