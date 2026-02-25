"use client";

import { useMemo, useRef, useState } from "react";
import Button from "@/Components/ui/Button";
import DoctorHeader from "../DoctorHeader";
import { useDoctor } from "@/ContextApi/doctorContext";
import { setDoctorContextAndNavigate, useNavigate } from "@/utils";

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
  { id: "e-1130", label: "1:30 PM - 1:45PM" },
  { id: "e-1200", label: "2:00 PM - 2:15PM" },
  { id: "e-0100a", label: "03:00 PM - 03:15PM" },
  { id: "e-0100b", label: "04:00 PM - 04:15PM" },
];

export default function BookAppointment() {
  const { doctor, setDoctor } = useDoctor();
  const navigate = useNavigate();
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDay, setSelectedDay] = useState(todayIso);
  const [selectedMorningSlot, setSelectedMorningSlot] = useState<string | null>(null);
  const [selectedEveningSlot, setSelectedEveningSlot] = useState<string | null>(null);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(todayIso);
  const [calendarError, setCalendarError] = useState("");
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const selectedSlot = selectedMorningSlot ?? selectedEveningSlot;
  const allSlots = [...morningSlots, ...eveningSlots];
  const selectedSlotLabel = allSlots.find((slot) => slot.id === selectedSlot)?.label ?? "Not selected";
  const isTodaySelected = selectedDay === todayIso;
  const daySlots = useMemo<DaySlot[]>(() => {
    const base = new Date(`${calendarDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return [];

    return Array.from({ length: 5 }, (_, index) => {
      const nextDate = new Date(base);
      nextDate.setDate(base.getDate() + index);
      const iso = nextDate.toISOString().slice(0, 10);
      const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(nextDate).toUpperCase();
      return {
        id: iso,
        day: dayLabel,
        date: String(nextDate.getDate()),
      };
    });
  }, [calendarDate]);

  const monthTitle = useMemo(() => {
    const parsedDate = new Date(`${selectedDay}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return "July, 2023";
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(parsedDate);
  }, [selectedDay]);

  const openNativeCalendar = () => {
    const input = dateInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null;
    if (!input) return;

    if (input.showPicker) {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const isPastDate = (value: string) => {
    if (!value) return false;
    return new Date(`${value}T00:00:00`).getTime() < new Date(`${todayIso}T00:00:00`).getTime();
  };

  const parseTimeToDate = (value: string, baseDate: Date) => {
    const normalized = value.trim().replace(/(\d)(AM|PM)$/i, "$1 $2").toUpperCase();
    const match = normalized.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/);
    if (!match) return null;

    const hour12 = Number(match[1]);
    const minute = Number(match[2]);
    const meridiem = match[3];
    let hour24 = hour12 % 12;
    if (meridiem === "PM") hour24 += 12;

    const parsed = new Date(baseDate);
    parsed.setHours(hour24, minute, 0, 0);
    return parsed;
  };

  const isSlotPassed = (slotLabel: string) => {
    if (!isTodaySelected) return false;
    const now = new Date();
    const baseDate = new Date(`${selectedDay}T00:00:00`);
    const [, endRaw = ""] = slotLabel.split("-");
    const endTimeDate = parseTimeToDate(endRaw.trim(), baseDate);
    if (!endTimeDate) return false;
    return endTimeDate.getTime() <= now.getTime();
  };

  const handleApplyCalendarDate = () => {
    if (!calendarDate) {
      setCalendarError("Please select a date.");
      return;
    }
    if (isPastDate(calendarDate)) {
      setCalendarError("You can select only today or a future date.");
      return;
    }

    setCalendarError("");
    setSelectedDay(calendarDate);
    setIsCalendarDialogOpen(false);
  };

  const handleBookAppointment = () => {
    if (!selectedSlot) return;
    if (isPastDate(selectedDay)) {
      setCalendarError("Past dates are not allowed.");
      return;
    }

    const timeSlot = allSlots.find((slot) => slot.id === selectedSlot);

    if (!timeSlot) return;
    if (isSlotPassed(timeSlot.label)) {
      setCalendarError("Selected time slot has already passed.");
      return;
    }
    const experienceValue = doctor.stats.find((stat) => stat.id === "experience")?.value ?? "0 years";
    const ratingValue = doctor.stats.find((stat) => stat.id === "rating")?.value ?? "0";
    const selectedDate = new Date(`${selectedDay}T00:00:00`);
    const appointmentDate = Number.isNaN(selectedDate.getTime())
      ? doctor.appointmentDate
      : new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(selectedDate);

    setDoctorContextAndNavigate(
      {
        id: "book-appointment",
        name: doctor.doctorName,
        specialty: doctor.specialist,
        experience: experienceValue,
        rating: ratingValue,
        description: "",
        tags: [],
        availableToday: doctor.status.toLowerCase().includes("available"),
      },
      "/dashBoard/appointmetReview?status=active",
      setDoctor,
      navigate,
      {
        status: "Active",
        appointmentDate,
        appointmentTime: timeSlot.label,
      }
    );
  };

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
            <p className="text-lg font-medium sm:text-xl">{monthTitle}</p>
            <button
              type="button"
              onClick={() => {
                setCalendarError("");
                setIsCalendarDialogOpen(true);
              }}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Open calendar dialog"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H6a1 1 0 0 1-1-1V10h14Zm0-12H5V6h14Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {daySlots.map((slot) => {
              const isActive = selectedDay === slot.id;
              const isPast = isPastDate(slot.id);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    if (isPast) return;
                    setSelectedDay(slot.id);
                    setCalendarDate(slot.id);
                  }}
                  disabled={isPast}
                  className={`rounded-2xl border px-3 py-3 text-center transition ${
                    isActive
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : isPast
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
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
              const isTimePassed = isSlotPassed(slot.label);
              const isDisabled = Boolean(slot.disabled) || isTimePassed;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedMorningSlot(slot.id);
                    setSelectedEveningSlot(null);
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition sm:px-4 sm:py-3 sm:text-base ${
                    isDisabled
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
              const isDisabled = isSlotPassed(slot.label);
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedEveningSlot(slot.id);
                    setSelectedMorningSlot(null);
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition sm:px-4 sm:py-3 sm:text-base ${
                    isDisabled
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

          <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-600">Selected Time Slot</p>
            <p className="text-base font-semibold text-cyan-700">{selectedSlotLabel}</p>
            {calendarError && <p className="mt-1 text-xs font-medium text-rose-600">{calendarError}</p>}
          </div>

          <Button
            type="button"
            onClick={handleBookAppointment}
            disabled={!selectedSlot}
            className="mt-6 w-full rounded-2xl bg-cyan-500 py-3 text-lg font-semibold text-white hover:bg-cyan-600 disabled:bg-cyan-300 sm:text-xl"
          >
            Book appointment
          </Button>
        </div>
      </section>
      {isCalendarDialogOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <h4 className="text-lg font-semibold text-slate-900">Select Date</h4>
            <p className="mt-1 text-sm text-slate-500">Enter or choose a date from calendar.</p>

            <div className="relative mt-4">
              <input
                ref={dateInputRef}
                type="date"
                value={calendarDate}
                min={todayIso}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setCalendarDate(nextValue);
                  if (isPastDate(nextValue)) {
                    setCalendarError("You can select only today or a future date.");
                    return;
                  }
                  setCalendarError("");
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-800 outline-none focus:border-cyan-500"
              />
            </div>
            {calendarError && <p className="mt-2 text-xs font-medium text-rose-600">{calendarError}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setIsCalendarDialogOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleApplyCalendarDate}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
