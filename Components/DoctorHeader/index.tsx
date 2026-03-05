import Image from "@/Components/ui/Image";
import React from "react";

type SpecialTitle = {
  value: string;
  onClick: () => void;
};

type Stat = {
  id: string;
  value: string;
  label: string;
  icon: React.ReactNode;
};

type DoctorHeaderProps = {
  status: string;
  doctorImage: string;
  doctorSignature?: string;
  doctorStamp?: string;
  specialist?: string;
  doctorDegree?: string;
  clinicLocation?: string;
  doctorName?: string;
  specialTitle?: SpecialTitle | null;
  stats?: Stat[];
};

function getFallbackStatIcon(stat: Stat) {
  const statKey = `${stat.id} ${stat.label}`.toLowerCase();

  if (statKey.includes("patient")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5 1.34 3.5 3 3.5Zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (statKey.includes("experience")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="M17 3h-1V1h-2v2H10V1H8v2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H7V9h10v10Zm-5-2 4-4-1.41-1.41L12 14.17l-1.59-1.58L9 14l3 3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (statKey.includes("rating")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (statKey.includes("review")) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-9 9H7V9h4v2Zm6 0h-4V9h4v2Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
      <path
        d="M11 7h2v6h-2zm0 8h2v2h-2zm1-13C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function normalizeDoctorStatusLabel(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "available" || normalized === "avaalble") return "online";
  if (normalized === "not available") return "offline";
  return normalized || "offline";
}

function formatAppointmentModeLabel(status: string) {
  const normalized = normalizeDoctorStatusLabel(status);
  const readable = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return `${readable} (Appointment Mode)`;
}

export default function DoctorHeader({
  status,
  doctorImage,
  doctorSignature = "",
  doctorStamp = "",
  specialist = "not defined",
  doctorDegree = "not defined",
  clinicLocation = "not defined",
  doctorName = "not defined",
  stats = [],
  specialTitle = null,
}: DoctorHeaderProps) {
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_50px_-24px_rgba(37,99,235,0.45)] md:p-6 mr-4 mt-2.5 ml-2.5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-cyan-100/40 blur-2xl" />
        {specialTitle && (
          <button
            type="button"
            className="absolute right-5 top-5 z-10 text-sm font-semibold text-blue-600 hover:text-blue-700 md:right-6 md:top-6"
            onClick={specialTitle.onClick}
          >
            {specialTitle.value}
          </button>
        )}

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex w-full items-center gap-3">
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
             {formatAppointmentModeLabel(status)}
              </p>
            </div>

            <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
              {doctorName}
            </h2>

            <p className="mt-1 text-base font-medium text-sky-600">
              {specialist}
            </p>

            <p className="mt-3 text-sm font-semibold text-blue-600">
              {doctorDegree}
            </p>

            {clinicLocation && (
              <p className="mt-1 text-sm text-slate-500">
                Fellow of {clinicLocation}
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm mt-10
          ">
            <Image
              src={doctorImage}
              alt={doctorName}
              width={96}
              height={96}
              className="h-24 w-24 object-cover"
            />
          </div>
        </div>
      </div>

      <div className="-mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-blue-100/80 bg-white/90 p-2 shadow-sm backdrop-blur md:grid-cols-4 ml-2.5 mr-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-xl border border-slate-100 bg-gradient-to-b from-white to-blue-50/30 px-3 py-3 text-center"
          >
            <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-blue-100">
              {stat.icon ?? getFallbackStatIcon(stat)}
            </div>
            <p className="text-lg font-semibold leading-none text-blue-600">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {(doctorSignature || doctorStamp) && (
        <div className="mt-3 ml-2.5 mr-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {doctorSignature ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Signature</p>
              <Image
                src={doctorSignature}
                alt={`${doctorName} signature`}
                width={160}
                height={60}
                className="h-14 w-auto object-contain"
              />
            </div>
          ) : null}

          {doctorStamp ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Clinic Stamp</p>
              <Image
                src={doctorStamp}
                alt={`${doctorName} stamp`}
                width={160}
                height={60}
                className="h-14 w-auto object-contain"
              />
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
