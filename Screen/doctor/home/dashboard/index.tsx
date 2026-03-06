"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/Components/ui/Card";
import { useDoctor } from "@/ContextApi/DoctorProfileContext";
import { useAppointment } from "@/ContextApi/appointmentContext";
import {
  CalendarDays,
  MapPin,
  Star,
  Stethoscope,
  Users,
  BriefcaseMedical,
  ArrowUpRight,
} from "lucide-react";

function getStatValue(
  stats: { id: string; label: string; value: string }[],
  options: { id?: string; labelPattern?: RegExp; fallback: string }
) {
  const byId = options.id
    ? stats.find(
        (item) => item.id.toLowerCase() === options.id?.toLowerCase()
      )
    : undefined;
  if (byId?.value) return byId.value;

  const byLabel = options.labelPattern
    ? stats.find((item) => options.labelPattern?.test(item.label))
    : undefined;
  if (byLabel?.value) return byLabel.value;

  return options.fallback;
}

function getStatusClasses(status: string) {
  const normalized = status.trim().toLowerCase();

  if (
    normalized.includes("online") ||
    normalized.includes("available") ||
    normalized.includes("avaalble")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("busy")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function normalizeDoctorStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "available" || normalized === "avaalble") return "online";
  if (normalized === "not available") return "offline";

  return normalized || "offline";
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitials(name: string) {
  const tokens = name.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) return "DR";

  return tokens
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

export default function DoctorDashboard() {
  const { doctor } = useDoctor();
  const { appointments } = useAppointment();

  const [status, setStatus] = useState(doctor.status);

  const toggleStatus = () => {
    setStatus((prev) => {
      const normalized = prev.toLowerCase();

      return normalized === "available" || normalized === "online"
        ? "offline"
        : "available";
    });
  };

  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);

  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((item) => item.status === "Upcoming"),
    [appointments]
  );

  const todayAppointments = useMemo(
    () =>
      upcomingAppointments.filter(
        (item) => item.appointmentDateIso === todayIso
      ),
    [upcomingAppointments, todayIso]
  );

  const nextAppointments = useMemo(
    () => upcomingAppointments.slice(0, 5),
    [upcomingAppointments]
  );

  const dashboardStats = [
    {
      id: "patients",
      label: "Patients Treated",
      value: getStatValue(doctor.stats, {
        id: "patients",
        labelPattern: /patient/i,
        fallback: "0",
      }),
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "experience",
      label: "Experience",
      value: getStatValue(doctor.stats, {
        id: "experience",
        labelPattern: /experience/i,
        fallback: "0",
      }),
      icon: <BriefcaseMedical className="h-4 w-4" />,
    },
    {
      id: "rating",
      label: "Rating",
      value: getStatValue(doctor.stats, {
        id: "rating",
        labelPattern: /rating/i,
        fallback: "0",
      }),
      icon: <Star className="h-4 w-4" />,
    },
    {
      id: "today",
      label: "Today Appointments",
      value: String(todayAppointments.length),
      icon: <CalendarDays className="h-4 w-4" />,
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#cffafe_0%,#f8fafc_45%,#f1f5f9_100%)] px-4 py-6 md:px-6">
      <section className="mx-auto max-w-6xl space-y-6">

        <Card className="overflow-hidden border-0 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 p-0 shadow-[0_24px_45px_-24px_rgba(14,116,144,0.7)]">
          <div className="flex flex-col gap-5 p-5 text-white md:flex-row md:items-end md:justify-between md:p-7">

            <div className="flex items-start gap-4">
              {doctor.doctorImage ? (
                <img
                  src={doctor.doctorImage}
                  alt={doctor.doctorName}
                  className="h-16 w-16 rounded-2xl border border-white/40 object-cover shadow-md md:h-20 md:w-20"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/40 bg-white/20 text-xl font-bold md:h-20 md:w-20 md:text-2xl">
                  {getInitials(doctor.doctorName)}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-50">
                  Doctor Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-bold md:text-3xl">
                  {doctor.doctorName}
                </h1>

                <p className="mt-1 flex items-center gap-2 text-sm text-cyan-50 md:text-base">
                  <Stethoscope className="h-4 w-4" />
                  {doctor.specialist || "Specialist not set"}
                </p>

                <p className="mt-1 flex items-center gap-2 text-xs text-cyan-100 md:text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {doctor.clinicLocation || "Clinic location not set"}
                </p>
              </div>
            </div>

            <div className="space-y-2 md:text-right">

              <p className="text-xs font-medium text-cyan-100">
                {currentDateLabel}
              </p>

              <div className="flex flex-row gap-1.5 -mr-2.5">

                <p className="text-xs font-medium text-cyan-100 mt-1">
                  Appointment:
                </p>

                <span
                  className={`inline-flex cursor-pointer hover:opacity-80 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    status
                  )}`}
                  onClick={toggleStatus}
                >
                  {normalizeDoctorStatusLabel(status)}
                </span>

              </div>

            </div>

          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <Card
              key={stat.id}
              className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_12px_28px_-22px_rgba(15,23,42,0.55)]"
            >
              <div className="inline-flex rounded-lg bg-slate-100 p-2 text-slate-600">
                {stat.icon}
              </div>

              <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
                {stat.label}
              </p>

              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>

       

        <div className="grid gap-4 lg:grid-cols-3 hidden">
          <Card className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
              <Link href="/doctor/home/patient" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                View Patients
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {nextAppointments.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  No upcoming appointments.
                </p>
              )}
              {nextAppointments.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {item.dayLabel}, {item.time}
                    </p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                      #{item.tokenNo}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Status: {item.status}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 bg-white/95 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">Update your profile and slots from one place.</p>
            <div className="mt-4 space-y-2">
              <Link
                href="/doctor/home/profile"
                className="block rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-100"
              >
                Edit Profile
              </Link>
              <Link
                href="/doctor/home/patient"
                className="block rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Manage Patients
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}