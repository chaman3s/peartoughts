"use client";

import { type ReactNode, useState } from "react";
import Button from "@/Components/ui/Button";
import DoctorHeader from "../DoctorHeader";
import { DoctorProvider, useDoctor, type DoctorHeaderData } from "@/ContextApi/doctorContext";

type Stat = {
  id: string;
  value: string;
  label: string;
  icon: ReactNode;
};

type DaySlot = {
  id: string;
  day: string;
  date: string;
};

type TimeSlot = {
  id: string;
  label: string;
  disabled?: boolean;
};

const stats: Stat[] = [
  {
    id: "patients",
    value: "5,000+",
    label: "patients",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5 1.34 3.5 3 3.5Zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "experience",
    value: "10+",
    label: "years expr.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="M17 3h-1V1h-2v2H10V1H8v2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H7V9h10v10Zm-5-2 4-4-1.41-1.41L12 14.17l-1.59-1.58L9 14l3 3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "rating",
    value: "4.8",
    label: "rating",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "reviews",
    value: "4,942",
    label: "reviews",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
        <path
          d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-9 9H7V9h4v2Zm6 0h-4V9h4v2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const daySlots: DaySlot[] = [
  { id: "13-mon", date: "13", day: "MON" },
  { id: "14-tue", date: "14", day: "TUE" },
  { id: "16-wed", date: "16", day: "WED" },
  { id: "17-wed", date: "17", day: "WED" },
  { id: "18-wed", date: "18", day: "WED" },
];

const morningSlots: TimeSlot[] = [
  { id: "m-0930", label: "09:30 AM - 9:45AM" },
  { id: "m-1000", label: "10:00 AM - 10:15AM" },
  { id: "m-1030", label: "10:30 AM - 10:45AM" },
  { id: "m-1100", label: "11:00 AM - 11:15AM", disabled: true },
  { id: "m-1130", label: "11:30 AM - 11:45AM" },
  { id: "m-1200", label: "12:00 PM - 12:15PM" },
  { id: "m-1230", label: "12:30 PM - 12:45PM", disabled: true },
  { id: "m-0100", label: "01:00 PM - 01:15PM" },
];

const eveningSlots: TimeSlot[] = [
  { id: "e-1130", label: "11:30 AM - 11:45AM" },
  { id: "e-1200", label: "12:00 PM - 12:15PM" },
  { id: "e-0100a", label: "01:00 PM - 01:15PM" },
  { id: "e-0100b", label: "01:00 PM - 01:15PM" },
];

const doctorData: DoctorHeaderData = {
  status: "Available Today",
  doctorName: "Dr. Kumar Das",
  specialist: "Ophthalmologist",
  doctorDegree: "MBBS, MS (Surgeon)",
  clinicLocation: "Fellow of Sanskar Netralaya, Chennai",
  doctorImage: "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
  stats,
};

function BookAppointmentContent() {
  const { doctor } = useDoctor();
  const [selectedDay, setSelectedDay] = useState(daySlots[1].id);
  const [selectedMorningSlot, setSelectedMorningSlot] = useState<string | null>(null);
  const [selectedEveningSlot, setSelectedEveningSlot] = useState<string | null>(null);

  const selectedSlot = selectedMorningSlot ?? selectedEveningSlot;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:px-6">
        <DoctorHeader
          status={doctor.status}
          doctorName={doctor.doctorName}
          specialist={doctor.specialist}
          doctorDegree={doctor.doctorDegree}
          clinicLocation={doctor.clinicLocation}
          doctorImage={doctor.doctorImage}
          stats={doctor.stats}
        />

        <div className="mx-auto mt-6  rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_14px_38px_-26px_rgba(15,23,42,0.45)] sm:p-6">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Book Appointment</h3>
          <div className="mt-4 flex items-center gap-2 text-slate-700">
            <p className="text-lg font-medium sm:text-xl">July, 2023</p>
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" aria-hidden="true">
              <path
                d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H6a1 1 0 0 1-1-1V10h14Zm0-12H5V6h14Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {daySlots.map((slot) => {
              const isActive = selectedDay === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedDay(slot.id)}
                  className={`rounded-2xl border px-3 py-3 text-center transition ${
                    isActive
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <p className={`text-2xl font-semibold leading-none ${isActive ? "text-white" : "text-slate-400"}`}>
                    {slot.date}
                  </p>
                  <p className={`mt-1.5 text-xs font-medium ${isActive ? "text-cyan-50" : "text-slate-500"}`}>
                    {slot.day}
                  </p>
                </button>
              );
            })}
          </div>

          <h4 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">Select slot</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {morningSlots.map((slot) => {
              const isSelected = selectedMorningSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={slot.disabled}
                  onClick={() => {
                    setSelectedMorningSlot(slot.id);
                    setSelectedEveningSlot(null);
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition sm:px-4 sm:py-3 sm:text-base ${
                    slot.disabled
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                      : isSelected
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : "border-slate-300 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          <h4 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">Evening Slot</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {eveningSlots.map((slot) => {
              const isSelected = selectedEveningSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    setSelectedEveningSlot(slot.id);
                    setSelectedMorningSlot(null);
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition sm:px-4 sm:py-3 sm:text-base ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : "border-slate-300 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            disabled={!selectedSlot}
            className="mt-6 w-full rounded-2xl bg-cyan-500 py-3 text-lg font-semibold text-white hover:bg-cyan-600 disabled:bg-cyan-300 sm:text-xl"
          >
            Book appointment
          </Button>
        </div>
      </section>
    </main>
  );
}

export default function BookAppointment() {
  return (
    <DoctorProvider initialDoctor={doctorData}>
      <BookAppointmentContent />
    </DoctorProvider>
  );
}
