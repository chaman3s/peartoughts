"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/Components/ui/Card";
import { useDoctor } from "@/ContextApi/doctorContext";
import { useAppointment } from "@/ContextApi/appointmentContext";

function getStatValue(stats: { id: string; label: string; value: string }[], id: string, fallback: string) {
  return stats.find((item) => item.id === id)?.value ?? fallback;
}

export default function DoctorDashboard() {
  const { doctor } = useDoctor();
  const { appointments } = useAppointment();
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const upcomingAppointments = useMemo(
    () => appointments.filter((item) => item.status === "Upcoming"),
    [appointments]
  );
  const todayAppointments = useMemo(
    () => upcomingAppointments.filter((item) => item.appointmentDateIso === todayIso),
    [upcomingAppointments, todayIso]
  );
  const nextAppointments = useMemo(() => upcomingAppointments.slice(0, 5), [upcomingAppointments]);

  const dashboardStats = [
    { id: "patients", label: "Patients", value: getStatValue(doctor.stats, "patients", "0") },
    { id: "experience", label: "Experience", value: getStatValue(doctor.stats, "experience", "0") },
    { id: "rating", label: "Rating", value: getStatValue(doctor.stats, "rating", "0") },
    { id: "today", label: "Today Appointments", value: String(todayAppointments.length) },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-6 md:px-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <Card className="p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">{doctor.doctorName}</h1>
          <p className="mt-1 text-sm text-slate-600 md:text-base">{doctor.specialist}</p>
          <p className="mt-1 text-sm text-slate-500">{doctor.clinicLocation}</p>
        </Card>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {dashboardStats.map((stat) => (
            <Card key={stat.id} className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
              <Link href="/home/appointments" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                View All
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {nextAppointments.length === 0 && (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  No upcoming appointments.
                </p>
              )}
              {nextAppointments.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.dayLabel}, {item.time}
                  </p>
                  <p className="text-xs text-slate-500">Token #{item.tokenNo}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              <Link
                href="/doctor/home/profile"
                className="block rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit Profile
              </Link>
              <Link
                href="/home/appointments"
                className="block rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Manage Appointments
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
