"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/Components/ui/Image";
import Button from "@/Components/ui/Button";
import { useAppointment, type AppointmentStatus } from "@/ContextApi/appointmentContext";
import logo from "@/assets/img/logo.jpg";

type AppointmentTab = AppointmentStatus;

const tabs: AppointmentTab[] = ["Upcoming", "Completed", "Canceled"];

const statusStyles: Record<AppointmentStatus, string> = {
  Upcoming: "border-cyan-200 bg-cyan-50 text-cyan-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Canceled: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function AppointmentScreen() {
  const { appointments } = useAppointment();
  const [activeTab, setActiveTab] = useState<AppointmentTab>("Upcoming");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMenuId) return;

    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [openMenuId]);

  const list = appointments.filter((item) => item.status === activeTab);
  const paidCount = appointments.filter((item) => item.paid).length;
  const totalCount = appointments.length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-[#eef8ff] to-white">
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 md:px-6">
        <div className="rounded-3xl border border-white/80 bg-white/85 p-5 shadow-[0_12px_35px_-24px_rgba(14,116,144,0.55)] backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">My Appointments</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Manage your visits</h1>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Track appointment status, payment, and quick actions in one place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:w-auto">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{totalCount}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-emerald-600">Paid</p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">{paidCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const active = tab === activeTab;
            const tabCount = appointments.filter((item) => item.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setOpenMenuId(null);
                }}
                className={`inline-flex min-w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition md:px-5 md:py-2.5 md:text-base ${
                  active
                    ? "border-cyan-500 bg-cyan-500 text-white shadow-[0_10px_24px_-16px_rgba(14,116,144,0.9)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tabCount}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-4">
          {list.map((item) => {
            const menuOpen = openMenuId === item.id;
            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:shadow-[0_25px_45px_-30px_rgba(8,47,73,0.65)]"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500" />

                <div className="p-4 md:p-6">
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:gap-5">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-28 sm:w-28">
                      <Image src={logo} alt={item.doctorName} fill className="object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 sm:pr-20">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
                          {item.doctorName}
                        </h2>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p className="rounded-xl bg-slate-50 px-3 py-2">
                          <span className="font-medium text-slate-500">Token:</span> #{item.tokenNo}
                        </p>
                        <p className="rounded-xl bg-slate-50 px-3 py-2">
                          <span className="font-medium text-slate-500">Schedule:</span> {item.dayLabel}, {item.time}
                        </p>
                        <p className="rounded-xl bg-slate-50 px-3 py-2 sm:col-span-2">
                          <span className="font-medium text-slate-500">Payment:</span>{" "}
                          <span className={item.paid ? "font-semibold text-emerald-700" : "font-semibold text-amber-600"}>
                            {item.paid ? "Paid" : "Pending"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="absolute right-0 top-0">
                      <button
                        type="button"
                        aria-label="Appointment actions"
                        onClick={() => setOpenMenuId((prev) => (prev === item.id ? null : item.id))}
                        className="rounded-full p-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.8" fill="currentColor" />
                          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                          <circle cx="12" cy="19" r="1.8" fill="currentColor" />
                        </svg>
                      </button>
                    </div>

                    {menuOpen && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                      >
                        {["View", "Reschedule", "Quick Query"].map((action) => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => setOpenMenuId(null)}
                            className="block w-full border-b border-slate-100 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition last:border-b-0 hover:bg-slate-50"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <p className="max-w-2xl text-sm leading-snug text-slate-600 md:text-base">
                        Reduce waiting time by paying consultation fees in advance and get faster check-in.
                      </p>
                      {!item.paid && item.status === "Upcoming" && (
                        <Button
                          type="button"
                          className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(6,182,212,0.9)] hover:bg-cyan-600"
                        >
                          Make Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {list.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-lg font-semibold text-slate-700">No {activeTab.toLowerCase()} appointments</p>
              <p className="mt-2 text-sm text-slate-500">Book a consultation to see it here.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
