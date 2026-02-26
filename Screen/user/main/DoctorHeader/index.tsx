import Image from "@/Components/ui/Image";
import React from "react";
type DoctorHeaderProps = {
  status: string;
  doctorImage: string;
  specialist:string;
  doctorDegree:string;
  clinicLocation:string;
  doctorName:string;
    stats: Stat[]; 

};
type Stat = {
  id: string;
  value: string;
  label: string;
  icon: React.ReactNode;

};
export default function DoctorHeader({status,doctorImage,specialist,doctorDegree,clinicLocation,doctorName,stats}:DoctorHeaderProps) {
    return(
      <>
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_50px_-24px_rgba(37,99,235,0.45)] md:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/50 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-cyan-100/40 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                { status}
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">{doctorName}</h2>
              <p className="mt-1 text-base font-medium text-sky-600">{specialist}</p>
              <p className="mt-3 text-sm font-semibold text-blue-600">{doctorDegree}</p>
              <p className="mt-1 text-sm text-slate-500">Fellow of {clinicLocation}</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              <Image src={doctorImage} alt="Dr. Kumar Das" width={96} height={96} className="h-24 w-24 object-cover" />
            </div>
          </div>
        </div>
          <div className="-mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-blue-100/80 bg-white/90 p-2 shadow-sm backdrop-blur md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-xl border border-slate-100 bg-gradient-to-b from-white to-blue-50/30 px-3 py-3 text-center"
            >
              <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-blue-100">{stat.icon}</div>
              <p className="text-lg font-semibold leading-none text-blue-600">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </>
    )
    
};
