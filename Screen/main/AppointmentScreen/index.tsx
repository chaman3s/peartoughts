"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/Components/ui/Image";
import Button from "@/Components/ui/Button";
import { useAppointment, type AppointmentStatus } from "@/ContextApi/appointmentContext";
import logo from "@/assets/img/logo.jpg";

type AppointmentTab = AppointmentStatus;

const tabs: AppointmentTab[] = ["Upcoming", "Completed", "Canceled"];

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

  return (
    <main className="min-h-screen bg-[#f4f4f4]">
      <section className="mx-auto w-full max-w-3xl px-4 pb-10 pt-3 md:px-6">
        <div className="border-b border-slate-200">
          <div className="flex gap-8">
            {tabs.map((tab) => {
              const active = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setOpenMenuId(null);
                  }}
                  className={`relative pb-3 text-[clamp(1.1rem,2.8vw,2rem)] font-medium transition ${
                    active ? "text-cyan-500" : "text-slate-400 hover:text-slate-500"
                  }`}
                >
                  {tab}
                  {active && <span className="absolute inset-x-0 -bottom-[2px] h-[5px] rounded-full bg-cyan-500" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7 space-y-4">
          {list.map((item) => {
            const menuOpen = openMenuId === item.id;
            return (
              <article key={item.id} className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm">
                <div className="relative flex gap-5">
                  <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-[28px] bg-slate-100">
                    <Image src={logo} alt={item.doctorName} fill className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1 pr-20">
                    <h2 className="text-[clamp(1.25rem,3.4vw,2.2rem)] font-semibold leading-tight tracking-tight text-slate-800">
                      {item.doctorName}
                    </h2>
                    <p className="mt-2 text-[clamp(1rem,2.4vw,1.5rem)] text-slate-700">Token no - {item.tokenNo}</p>
                    <p className="mt-1 text-[clamp(1rem,2.5vw,1.6rem)] text-slate-700">
                      {item.dayLabel} <span className="mx-3 text-slate-300">|</span>
                      <span className="font-semibold text-cyan-500">{item.time}</span>
                    </p>
                    <p className="mt-1 text-[clamp(1rem,2.5vw,1.6rem)] text-slate-700">
                      Payment <span className="mx-3 text-slate-300">|</span>
                      <span className={item.paid ? "text-emerald-600" : "text-slate-400"}>
                        {item.paid ? "Paid" : "Not paid"}
                      </span>
                    </p>
                  </div>

                  <div className="absolute right-0 top-1">
                    <button
                      type="button"
                      aria-label="Appointment actions"
                      onClick={() => setOpenMenuId((prev) => (prev === item.id ? null : item.id))}
                      className="rounded-full p-1 text-slate-700 hover:bg-slate-100"
                    >
                      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                        <circle cx="12" cy="5" r="1.8" fill="currentColor" />
                        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
                        <circle cx="12" cy="19" r="1.8" fill="currentColor" />
                      </svg>
                    </button>
                  </div>

                  {menuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-2 top-10 z-20 w-52 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg"
                    >
                      {["View", "Reschedule", "Quick Query"].map((action) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => setOpenMenuId(null)}
                          className="block w-full border-b border-slate-200 px-4 py-2 text-left text-base font-medium text-slate-800 last:border-b-0 hover:bg-slate-50"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <p className="max-w-xl text-[clamp(1rem,2.4vw,1.5rem)] leading-snug text-slate-700">
                      Reduce your waiting time and visiting time by paying the consulting fee upfront
                    </p>
                    <Button
                      type="button"
                      className="rounded-2xl bg-cyan-500 px-7 py-3 text-xl font-semibold text-white hover:bg-cyan-600"
                    >
                      Make Payment
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}

          {list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center text-lg text-slate-500">
              No {activeTab.toLowerCase()} appointments.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
