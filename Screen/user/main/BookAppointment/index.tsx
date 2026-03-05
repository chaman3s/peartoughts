"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Button from "@/Components/ui/Button";
import DoctorHeader from "../DoctorHeader";
import { useDoctor } from "@/ContextApi/doctorContext";
import { useAppointment } from "@/ContextApi/appointmentContext";
import { setDoctorContextAndNavigate, useNavigate } from "@/utils";
import type { PersistedSlotSettings, SlotTimeType } from "@/types/slotSettings";

type DaySlot = {
  id: string;
  day: string;
  date: string;
};

type TimeSlot = {
  id: string;
  label: string;
  disabled?: boolean;
  startMinutes?: number;
  endMinutes?: number;
};

const fallbackMorningSlots: TimeSlot[] = [
  { id: "m-0930", label: "09:30 AM - 9:45AM" },
  { id: "m-1000", label: "10:00 AM - 10:15AM" },
  { id: "m-1030", label: "10:30 AM - 10:45AM" },
  { id: "m-1100", label: "11:00 AM - 11:15AM", disabled: true },
  { id: "m-1130", label: "11:30 AM - 11:45AM" },
  { id: "m-1200", label: "12:00 PM - 12:15PM" },
  { id: "m-1230", label: "12:30 PM - 12:45PM", disabled: true },
  { id: "m-0100", label: "01:00 PM - 01:15PM" },
];

const fallbackEveningSlots: TimeSlot[] = [
  { id: "e-1130", label: "1:30 PM - 1:45PM" },
  { id: "e-1200", label: "2:00 PM - 2:15PM" },
  { id: "e-0100a", label: "03:00 PM - 03:15PM" },
  { id: "e-0100b", label: "04:00 PM - 04:15PM" },
];

type StoredDoctorRecord = {
  name?: string;
  specialty?: string;
  slotSetting?: PersistedSlotSettings;
};

const dayKeyByWeekDay = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const dayTokenMap: Record<string, string> = {
  mon: "mon",
  monday: "mon",
  tue: "tue",
  tues: "tue",
  tuesday: "tue",
  wed: "wed",
  wednesday: "wed",
  thu: "thu",
  thur: "thu",
  thurs: "thu",
  thursday: "thu",
  fri: "fri",
  friday: "fri",
  sat: "sat",
  saturday: "sat",
  sun: "sun",
  sunday: "sun",
};
const presetRangeMap: Record<Exclude<SlotTimeType, "custom">, [string, string]> = {
  "24": ["00:00", "24:00"],
  office: ["09:00", "17:00"],
  morning: ["06:00", "14:00"],
  evening: ["14:00", "22:00"],
};

let cachedDoctorDataRaw: string | null | undefined;
let cachedDoctorDataSnapshot: StoredDoctorRecord[] = [];
const EMPTY_DOCTOR_DATA: StoredDoctorRecord[] = [];

const subscribeDoctorData = () => () => undefined;
const getServerDoctorDataSnapshot = () => EMPTY_DOCTOR_DATA;

function normalizeText(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeDayToken(token: string) {
  return dayTokenMap[token.trim().toLowerCase()] ?? token.trim().toLowerCase();
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isBeforeIsoDate(value: string, minValue: string) {
  const valueTime = new Date(`${value}T00:00:00`).getTime();
  const minTime = new Date(`${minValue}T00:00:00`).getTime();
  if (Number.isNaN(valueTime) || Number.isNaN(minTime)) return false;
  return valueTime < minTime;
}

function toMinutes(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 24 || minute < 0 || minute > 59) return null;
  if (hour === 24 && minute !== 0) return null;
  return hour * 60 + minute;
}

function toTwelveHour(minutes: number) {
  const bounded = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours24 = Math.floor(bounded / 60);
  const mins = bounded % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${meridiem}`;
}

function isPersistedSlotSettings(value: unknown): value is PersistedSlotSettings {
  if (!value || typeof value !== "object") return false;
  const data = value as PersistedSlotSettings;
  return (
    Array.isArray(data.days) &&
    typeof data.timeType === "string" &&
    Array.isArray(data.customSlots) &&
    typeof data.note === "string" &&
    typeof data.slotDuration === "number" &&
    typeof data.slotPrice === "number"
  );
}

function isValidPersistedSlotSetting(setting: PersistedSlotSettings) {
  if (!Array.isArray(setting.days) || setting.days.length === 0) return false;
  if (setting.slotDuration <= 0) return false;

  if (setting.timeType !== "custom") {
    return Boolean(presetRangeMap[setting.timeType]);
  }

  return setting.customSlots.some(
    (group) =>
      Array.isArray(group.days) &&
      group.days.length > 0 &&
      Array.isArray(group.slots) &&
      group.slots.some((slot) => {
        const start = toMinutes(slot.startTime);
        const end = toMinutes(slot.endTime);
        return start !== null && end !== null && end > start;
      })
  );
}

function getSlotUpdatedAt(setting: PersistedSlotSettings) {
  if (!setting.updatedAt) return 0;
  const time = new Date(setting.updatedAt).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getDoctorDataSnapshot() {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem("doctor_data");
  if (raw === cachedDoctorDataRaw) return cachedDoctorDataSnapshot;

  cachedDoctorDataRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedDoctorDataSnapshot = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedDoctorDataSnapshot = [];
  }

  return cachedDoctorDataSnapshot;
}

function derivePresetSlots(
  timeType: Exclude<SlotTimeType, "custom">,
  duration: number
): TimeSlot[] {
  const [startRaw, endRaw] = presetRangeMap[timeType];
  const start = toMinutes(startRaw);
  const end = toMinutes(endRaw);
  if (start === null || end === null || end <= start) return [];

  const step = duration > 0 ? duration : 15;
  const slots: TimeSlot[] = [];

  for (let cursor = start; cursor + step <= end; cursor += step) {
    const next = cursor + step;
    slots.push({
      id: `preset-${timeType}-${cursor}-${next}`,
      label: `${toTwelveHour(cursor)} - ${toTwelveHour(next)}`,
      startMinutes: cursor,
      endMinutes: next,
    });
  }

  return slots;
}

function deriveCustomSlots(setting: PersistedSlotSettings, dayKey: string): TimeSlot[] {
  const duration = Number.isFinite(setting.slotDuration) && setting.slotDuration > 0 ? setting.slotDuration : 15;

  return setting.customSlots.flatMap((group) => {
    const normalizedDays = (group.days ?? []).map(normalizeDayToken);
    if (!normalizedDays.includes(dayKey)) return [];

    return group.slots.flatMap((slot) => {
      const start = toMinutes(slot.startTime);
      const end = toMinutes(slot.endTime);
      if (start === null || end === null || end <= start) return [];

      const derived: TimeSlot[] = [];
      for (let cursor = start; cursor + duration <= end; cursor += duration) {
        const next = cursor + duration;
        derived.push({
          id: `custom-${group.id}-${slot.id}-${cursor}-${next}`,
          label: `${toTwelveHour(cursor)} - ${toTwelveHour(next)}`,
          startMinutes: cursor,
          endMinutes: next,
        });
      }

      return derived;
    });
  });
}

export default function BookAppointment() {
  const { doctor, setDoctor } = useDoctor();
  const { appointments, addAppointment } = useAppointment();
  const navigate = useNavigate();
  const doctorData = useSyncExternalStore(
    subscribeDoctorData,
    getDoctorDataSnapshot,
    getServerDoctorDataSnapshot
  );
  const todayIso = useMemo(() => toLocalIsoDate(new Date()), []);
  const [selectedDay, setSelectedDay] = useState(todayIso);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(todayIso);
  const [calendarError, setCalendarError] = useState("");
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const selectedDayKey = useMemo(() => {
    const date = new Date(`${selectedDay}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "";
    return dayKeyByWeekDay[date.getDay()] ?? "";
  }, [selectedDay]);
  const persistedSlotSetting = useMemo(() => {
    const candidates = doctorData
      .filter((item) => {
        if (!item || typeof item !== "object") return false;
        return (
          normalizeText(item.name) === normalizeText(doctor.doctorName) &&
          normalizeText(item.specialty) === normalizeText(doctor.specialist)
        );
      })
      .map((item) => item.slotSetting)
      .filter((setting): setting is PersistedSlotSettings => isPersistedSlotSettings(setting))
      .filter((setting) => isValidPersistedSlotSetting(setting))
      .sort((a, b) => getSlotUpdatedAt(b) - getSlotUpdatedAt(a));

    return candidates[0] ?? null;
  }, [doctorData, doctor.doctorName, doctor.specialist]);
  const earliestBookableDate = useMemo(() => {
    if (!persistedSlotSetting?.startDate) return todayIso;
    const startDate = persistedSlotSetting.startDate;
    const parsed = new Date(`${startDate}T00:00:00`).getTime();
    if (Number.isNaN(parsed)) return todayIso;
    return isBeforeIsoDate(startDate, todayIso) ? todayIso : startDate;
  }, [persistedSlotSetting?.startDate, todayIso]);
  const isBeforeStartDate = useMemo(() => {
    if (!persistedSlotSetting) return false;
    return isBeforeIsoDate(selectedDay, earliestBookableDate);
  }, [persistedSlotSetting, selectedDay, earliestBookableDate]);
  const usePersistedSlots = Boolean(persistedSlotSetting);
  const isConfiguredDay = useMemo(() => {
    if (!persistedSlotSetting || isBeforeStartDate) return false;
    return persistedSlotSetting.days.map(normalizeDayToken).includes(selectedDayKey);
  }, [persistedSlotSetting, selectedDayKey, isBeforeStartDate]);
  const derivedSlots = useMemo<TimeSlot[]>(() => {
    if (!persistedSlotSetting || !selectedDayKey || !isConfiguredDay) return [];

    if (persistedSlotSetting.timeType === "custom") {
      return deriveCustomSlots(persistedSlotSetting, selectedDayKey);
    }

    return derivePresetSlots(persistedSlotSetting.timeType, persistedSlotSetting.slotDuration);
  }, [persistedSlotSetting, selectedDayKey, isConfiguredDay]);
  const morningSlots = useMemo<TimeSlot[]>(() => {
    if (!usePersistedSlots) return fallbackMorningSlots;
    return derivedSlots.filter((slot) => (slot.startMinutes ?? 24 * 60) < 14 * 60);
  }, [usePersistedSlots, derivedSlots]);
  const eveningSlots = useMemo<TimeSlot[]>(() => {
    if (!usePersistedSlots) return fallbackEveningSlots;
    return derivedSlots.filter((slot) => (slot.startMinutes ?? 0) >= 14 * 60);
  }, [usePersistedSlots, derivedSlots]);
  const allSlots = useMemo(() => [...morningSlots, ...eveningSlots], [morningSlots, eveningSlots]);
  const selectedSlot = allSlots.find((slot) => slot.id === selectedSlotId) ?? null;
  const selectedSlotLabel = selectedSlot?.label ?? "Not selected";
  const isTodaySelected = selectedDay === todayIso;
  useEffect(() => {
    if (!usePersistedSlots) return;
    if (!isBeforeIsoDate(selectedDay, earliestBookableDate)) return;
    setSelectedDay(earliestBookableDate);
    setCalendarDate(earliestBookableDate);
    setSelectedSlotId(null);
  }, [usePersistedSlots, selectedDay, earliestBookableDate]);
  const daySlots = useMemo<DaySlot[]>(() => {
    const base = new Date(`${calendarDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) return [];

    return Array.from({ length: 5 }, (_, index) => {
      const nextDate = new Date(base);
      nextDate.setDate(base.getDate() + index);
      const iso = toLocalIsoDate(nextDate);
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

  const bookedTimesForSelectedDay = useMemo(() => {
    return new Set(
      appointments
        .filter((item) => item.appointmentDateIso === selectedDay && item.status !== "Canceled")
        .map((item) => item.time.trim())
    );
  }, [appointments, selectedDay]);

  const isAlreadyBooked = (slotLabel: string) => {
    const slotStart = slotLabel.split("-")[0]?.trim() ?? slotLabel.trim();
    return bookedTimesForSelectedDay.has(slotStart);
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
    if (isBeforeIsoDate(calendarDate, earliestBookableDate)) {
      setCalendarError(`Slots start from ${earliestBookableDate}.`);
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
    if (isBeforeIsoDate(selectedDay, earliestBookableDate)) {
      setCalendarError(`Slots start from ${earliestBookableDate}.`);
      return;
    }

    if (isSlotPassed(selectedSlot.label)) {
      setCalendarError("Selected time slot has already passed.");
      return;
    }
    if (isAlreadyBooked(selectedSlot.label)) {
      setCalendarError("This slot is already booked for the selected day.");
      return;
    }
    const experienceValue = doctor.stats.find((stat) => stat.id === "experience")?.value ?? "0 years";
    const ratingValue = doctor.stats.find((stat) => stat.id === "rating")?.value ?? "0";
    const selectedDate = new Date(`${selectedDay}T00:00:00`);
    const appointmentDate = Number.isNaN(selectedDate.getTime())
      ? doctor.appointmentDate
      : new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(selectedDate);
    const dayLabel = selectedDay === todayIso ? "Today" : appointmentDate;
    const slotTime = selectedSlot.label.split("-")[0]?.trim() ?? selectedSlot.label;

    addAppointment({
      doctorName: doctor.doctorName,
      appointmentDateIso: selectedDay,
      dayLabel,
      time: slotTime,
      paid: false,
      status: "Upcoming",
    });

    setDoctorContextAndNavigate(
      {
        id: "book-appointment",
        doctorImage: doctor.doctorImage,
        name: doctor.doctorName,
        specialty: doctor.specialist,
        experience: experienceValue,
        rating: ratingValue,
        description: "",
        tags: [],
        availableToday: doctor.status.toLowerCase().includes("available"),
      },
      "/home/dashBoard/appointmetReview?status=active",
      setDoctor,
      navigate,
      {
        status: "Active",
        appointmentDate,
        appointmentTime: selectedSlot.label,
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
          clinicName={doctor.clinicName}
          clinicLocation={doctor.clinicLocation}
          clinicAddress={doctor.clinicAddress}
          doctorLicenseNo={doctor.doctorLicenseNo}
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
              const isBeforeConfiguredStart = usePersistedSlots && isBeforeIsoDate(slot.id, earliestBookableDate);
              const isDisabledDate = isPast || isBeforeConfiguredStart;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    if (isDisabledDate) return;
                    setSelectedDay(slot.id);
                    setCalendarDate(slot.id);
                  }}
                  disabled={isDisabledDate}
                  className={`rounded-2xl border px-3 py-3 text-center transition ${
                    isActive
                      ? "border-cyan-500 bg-cyan-500 text-white"
                      : isDisabledDate
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
              const isSelected = selectedSlotId === slot.id;
              const isTimePassed = isSlotPassed(slot.label);
              const isBooked = isAlreadyBooked(slot.label);
              const isDisabled = Boolean(slot.disabled) || isTimePassed || isBooked;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedSlotId(slot.id);
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
                  {isBooked && <span className="ml-1 text-xs font-semibold">(Booked)</span>}
                </button>
              );
            })}
          </div>

          <h4 className="mt-6 text-lg font-semibold text-slate-900 sm:text-xl">Evening Slot</h4>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {eveningSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const isBooked = isAlreadyBooked(slot.label);
              const isDisabled = isSlotPassed(slot.label) || isBooked;
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    setSelectedSlotId(slot.id);
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
                  {isBooked && <span className="ml-1 text-xs font-semibold">(Booked)</span>}
                </button>
              );
            })}
          </div>

          {usePersistedSlots && isBeforeStartDate && (
            <p className="mt-4 text-sm font-medium text-rose-600">
              Slots start from {earliestBookableDate}.
            </p>
          )}
          {usePersistedSlots && !isBeforeStartDate && !isConfiguredDay && (
            <p className="mt-4 text-sm font-medium text-rose-600">
              No slots available for this day.
            </p>
          )}
          {usePersistedSlots && isConfiguredDay && allSlots.length === 0 && (
            <p className="mt-4 text-sm font-medium text-slate-500">
              No slots available.
            </p>
          )}

          <div className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-600">Selected Time Slot</p>
            <p className="text-base font-semibold text-cyan-700">{selectedSlotLabel}</p>
            {calendarError && <p className="mt-1 text-xs font-medium text-rose-600">{calendarError}</p>}
          </div>

          <Button
            type="button"
            onClick={handleBookAppointment}
            disabled={!selectedSlot || (usePersistedSlots && (!isConfiguredDay || allSlots.length === 0))}
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
                min={earliestBookableDate}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setCalendarDate(nextValue);
                  if (isPastDate(nextValue)) {
                    setCalendarError("You can select only today or a future date.");
                    return;
                  }
                  if (isBeforeIsoDate(nextValue, earliestBookableDate)) {
                    setCalendarError(`Slots start from ${earliestBookableDate}.`);
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
