"use client";

import { useState } from "react";
import Button from "@/Components/ui/Button";
import DoctorHeader from "../DoctorHeader";
import { useDoctor } from "@/ContextApi/doctorContext";

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

export default function BookAppointment() {
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
