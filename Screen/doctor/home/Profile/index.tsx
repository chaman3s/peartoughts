"use client";

import React, { useState, useMemo } from "react";
import { useDoctor } from "@/ContextApi/DoctorProfileContext";
import DoctorHeader from "@/Components/DoctorHeader";
import SlotForm, { SlotSettings } from "./SlotForm";
import DoctorHeaderForm from "./DoctorHeaderForm";
import { Card } from "@/Components/ui/Card";
import { VerticalContainer } from "@/Components/ui/Container";
import Text from "@/Components/ui/Text";
import type { PersistedSlotSettings } from "@/types/slotSettings";
import { CalendarDays, Clock3, IndianRupee, Stethoscope } from "lucide-react";

type DashboardDoctor = {
  id: string;
  doctorImage: string;
  doctorSignature?: string;
  doctorStamp?: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  description: string;
  tags: string[];
  availableToday: boolean;
  doctorEmail?: string;
  slotSetting?: PersistedSlotSettings;
};

/* ---------------- LABEL MAPS ---------------- */

const dayLabelMap: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const timePresetLabel: Record<string, string> = {
  "24": "24 Hours",
  office: "Office (09:00-17:00)",
  morning: "Morning (06:00-14:00)",
  evening: "Evening (14:00-22:00)",
};

/* ---------------- HELPERS ---------------- */

const ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WORKING_DAYS = ["mon", "tue", "wed", "thu", "fri"];
const WEEKENDS = ["sat", "sun"];
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

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const as = [...a].sort().join(",");
  const bs = [...b].sort().join(",");
  return as === bs;
}

function getStatValue(stats: { label: string; value: string }[], key: "experience" | "rating") {
  const stat = stats.find((item) => item.label.toLowerCase().includes(key));
  if (!stat?.value) return "0";
  return stat.value;
}

function normalizeExperience(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "0 years";
  return /year/i.test(trimmed) ? trimmed : `${trimmed} years`;
}

function normalizeRating(value: string) {
  const match = value.match(/(\d+(\.\d+)?)/);
  return match?.[1] ?? "0";
}

function normalizeKey(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value?: string) {
  if (!value) return "Not set";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(parsed);
}

function normalizeSlotSetting(setting: SlotSettings): PersistedSlotSettings {
  const normalizeDayToken = (token: string) => dayTokenMap[token.trim().toLowerCase()] ?? token.trim().toLowerCase();
  const normalizeDayList = (tokens: string[]) =>
    Array.from(new Set(tokens.map(normalizeDayToken).filter(Boolean)));

  return {
    days: Array.isArray(setting.days) ? normalizeDayList(setting.days) : [],
    timeType: setting.timeType,
    customSlots: Array.isArray(setting.customSlots)
      ? setting.customSlots.map((group) => ({
          ...group,
          days: normalizeDayList(group.days ?? []),
        }))
      : [],
    startDate: typeof setting.startDate === "string" ? setting.startDate : toLocalIsoDate(new Date()),
    note: setting.note ?? "",
    slotDuration: Number.isFinite(setting.slotDuration) && setting.slotDuration > 0 ? setting.slotDuration : 15,
    slotPrice: Number.isFinite(setting.slotPrice) && setting.slotPrice >= 0 ? setting.slotPrice : 0,
    updatedAt: new Date().toISOString(),
  };
}

function syncDoctorDataToLocalStorage(doctor: {
  doctorName: string;
  doctorImage: string;
  doctorSignature?: string;
  doctorStamp?: string;
  specialist: string;
  status: string;
  doctorEmail: string;
  stats: { label: string; value: string }[];
}, tags?: string[], slotSetting?: SlotSettings) {
  if (typeof window === "undefined") return;

  const storageKey = "doctor_data";
  const raw = window.localStorage.getItem(storageKey);
  let parsed: unknown = [];

  try {
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    parsed = [];
  }

  const doctorList: DashboardDoctor[] = Array.isArray(parsed) ? parsed : [];
  const mail = normalizeKey(doctor.doctorEmail);
  const profileKey = `${normalizeKey(doctor.doctorName)}::${normalizeKey(doctor.specialist)}`;

  const existingIndex = doctorList.findIndex((item) => {
    const itemEmail = normalizeKey(item.doctorEmail);
    const itemProfileKey = `${normalizeKey(item.name)}::${normalizeKey(item.specialty)}`;
    if (mail) {
      return itemEmail === mail || itemProfileKey === profileKey;
    }
    return itemProfileKey === profileKey;
  });

  const existing = existingIndex >= 0 ? doctorList[existingIndex] : undefined;

  const nextDoctor: DashboardDoctor = {
    id: existing?.id || `doc-${doctorList.length + 1}`,
    doctorImage: doctor.doctorImage,
    doctorSignature: doctor.doctorSignature || existing?.doctorSignature,
    doctorStamp: doctor.doctorStamp || existing?.doctorStamp,
    name: doctor.doctorName,
    specialty: doctor.specialist,
    experience: normalizeExperience(getStatValue(doctor.stats, "experience")),
    rating: normalizeRating(getStatValue(doctor.stats, "rating")),
    description: existing?.description || `Specialist in ${doctor.specialist || "general care"}.`,
    tags: tags && tags.length ? tags : existing?.tags || ["Online", "Top Rated"],
    availableToday: doctor.status.toLowerCase().includes("online") || doctor.status.toLowerCase().includes("available"),
    doctorEmail: mail || existing?.doctorEmail,
    slotSetting: slotSetting ? normalizeSlotSetting(slotSetting) : existing?.slotSetting,
  };

  if (existingIndex >= 0) {
    doctorList[existingIndex] = { ...doctorList[existingIndex], ...nextDoctor };
  } else {
    doctorList.push(nextDoctor);
  }

  window.localStorage.setItem(storageKey, JSON.stringify(doctorList));
}

/* ⭐ derive readable custom time (UPDATED for nested slots) */
function getCustomTimeLabel(settings: SlotSettings) {
  if (!settings.customSlots?.length) return "Not set";

  const allSlots = settings.customSlots.flatMap((group) =>
    group.slots?.map((s) => ({
      start: s.startTime,
      end: s.endTime,
    })) ?? []
  );

  if (!allSlots.length) return "Not set";

  if (allSlots.length === 1) {
    return `${allSlots[0].start} - ${allSlots[0].end}`;
  }

  const startTimes = allSlots.map((s) => s.start).sort();
  const endTimes = allSlots.map((s) => s.end).sort();

  return `${startTimes[0]} - ${endTimes[endTimes.length - 1]}`;
}

/* ---------------- COMPONENT ---------------- */

export default function DoctorProfile() {
  const { doctor, updateDoctor } = useDoctor();
  const [editSlot, setEditSlot] = useState(false);
  const [editHeader, setEditHeader] = useState(false);

  const [slotSetting, setSlotSetting] = useState<SlotSettings>({
    days: ["mon", "tue", "wed", "thu", "fri"],
    timeType: "custom",
    customSlots: [],
    startDate: toLocalIsoDate(new Date()),
    note: "",
    slotDuration: 15,
    slotPrice: 0,
  });

  /* ⭐ smart day label */
  const daySummaryLabel = useMemo(() => {
    const d = slotSetting.days || [];

    if (arraysEqual(d, ALL_DAYS)) return "Whole Week";
    if (arraysEqual(d, WORKING_DAYS)) return "Working Days";
    if (arraysEqual(d, WEEKENDS)) return "Weekends";

    return null;
  }, [slotSetting.days]);

  /* ⭐ smart time label */
  const timeSummaryLabel = useMemo(() => {
    if (slotSetting.timeType === "custom") {
      return getCustomTimeLabel(slotSetting);
    }
    return timePresetLabel[slotSetting.timeType] ?? "Not set";
  }, [slotSetting]);

  const customRangeCount = useMemo(() => {
    if (slotSetting.timeType !== "custom") return 0;
    return slotSetting.customSlots.reduce((count, group) => count + group.slots.length, 0);
  }, [slotSetting.customSlots, slotSetting.timeType]);

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      {/* Header */}
      <div className="mt-5">
        {editHeader ? (
          <DoctorHeaderForm
            value={doctor}
            onCancel={() => setEditHeader(false)}
            onSave={(updates, tags) => {
              updateDoctor(updates);
              const nextDoctorData = {
                doctorName: updates.doctorName ?? doctor.doctorName,
                doctorImage: updates.doctorImage ?? doctor.doctorImage,
                doctorSignature: updates.doctorSignature ?? doctor.doctorSignature,
                doctorStamp: updates.doctorStamp ?? doctor.doctorStamp,
                specialist: updates.specialist ?? doctor.specialist,
                status: updates.status ?? doctor.status,
                doctorEmail: updates.doctorEmail ?? doctor.doctorEmail,
                stats: updates.stats ?? doctor.stats,
              };
              syncDoctorDataToLocalStorage(nextDoctorData, tags);
              setEditHeader(false);
            }}
          />
        ) : (
          <DoctorHeader
            specialTitle={{ value: "Edit Profile", onClick: () => setEditHeader(true) }}
            status={doctor.status}
            doctorName={doctor.doctorName}
            specialist={doctor.specialist || "not defined"}
            doctorDegree={doctor.doctorDegree || "not defined"}
            clinicLocation={doctor.clinicLocation || "not defined"}
            doctorImage={doctor.doctorImage}
            doctorSignature={doctor.doctorSignature}
            doctorStamp={doctor.doctorStamp}
            stats={doctor.stats || []}
          />
        )}
      </div>

      {/* Body */}
      <div className="mt-5 m-2.5">
        {editSlot ? (
          <SlotForm
            value={slotSetting}
            onChange={setSlotSetting}
            onsubmit={(open, payload) => {
              setEditSlot(open);
              if (!payload) return;

              setSlotSetting(payload);
              syncDoctorDataToLocalStorage(
                {
                  doctorName: doctor.doctorName,
                  doctorImage: doctor.doctorImage,
                  doctorSignature: doctor.doctorSignature,
                  doctorStamp: doctor.doctorStamp,
                  specialist: doctor.specialist,
                  status: doctor.status,
                  doctorEmail: doctor.doctorEmail,
                  stats: doctor.stats,
                },
                undefined,
                payload
              );
            }}
          />
        ) : (
          <Card>
            <VerticalContainer>
              <div className="space-y-6 p-4 sm:p-6">
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-5 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Text as="h2" className="text-xl font-semibold text-white">
                        Slot Summary
                      </Text>
                      <Text className="mt-1 text-sm text-blue-50">
                        Easy view of your selected days, time ranges and consultation fee.
                      </Text>
                    </div>
                    <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                      {slotSetting.timeType === "custom" ? `${customRangeCount} custom ranges` : timeSummaryLabel}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      <Text className="text-xs font-medium uppercase tracking-wide">Selected Days</Text>
                    </div>
                    <Text className="text-lg font-semibold text-slate-900">
                      {slotSetting.days?.length || 0}
                    </Text>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      <Text className="text-xs font-medium uppercase tracking-wide">Slot Duration</Text>
                    </div>
                    <Text className="text-lg font-semibold text-slate-900">
                      {slotSetting.slotDuration} min
                    </Text>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <IndianRupee className="h-4 w-4" />
                      <Text className="text-xs font-medium uppercase tracking-wide">Consultation Fee</Text>
                    </div>
                    <Text className="text-lg font-semibold text-slate-900">
                      {slotSetting.slotPrice}
                    </Text>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      <Text className="text-xs font-medium uppercase tracking-wide">Start Date</Text>
                    </div>
                    <Text className="text-lg font-semibold text-slate-900">
                      {formatDateLabel(slotSetting.startDate)}
                    </Text>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Days
                  </Text>

                  {!slotSetting.days?.length ? (
                    <Text className="text-sm text-slate-400">No days selected yet</Text>
                  ) : daySummaryLabel ? (
                    <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      {daySummaryLabel}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slotSetting.days.map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
                        >
                          {dayLabelMap[d] ?? d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Time Ranges
                  </Text>

                  {slotSetting.timeType !== "custom" ? (
                    <div className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                      {timeSummaryLabel}
                    </div>
                  ) : slotSetting.customSlots.length === 0 ? (
                    <Text className="text-sm text-slate-400">No custom time ranges added</Text>
                  ) : (
                    <div className="space-y-3">
                      <Text className="text-xs text-slate-500">
                        Each card below shows days and the slot ranges that apply to those days.
                      </Text>

                      {slotSetting.customSlots.map((group, groupIndex) => (
                        <div
                          key={group.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <Text className="text-sm font-semibold text-slate-800">
                              Schedule Group {groupIndex + 1}
                            </Text>
                            <Text className="text-xs text-slate-500">
                              {group.days.length} day{group.days.length === 1 ? "" : "s"} • {group.slots.length} slot{group.slots.length === 1 ? "" : "s"}
                            </Text>
                          </div>

                          <div className="space-y-2">
                            <Text className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Applies To Days
                            </Text>
                            <div className="flex flex-wrap gap-2">
                              {group.days.map((d) => (
                                <span
                                  key={d}
                                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                                >
                                  {dayLabelMap[d] ?? d}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <Text className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Available Slots Timing Range for a day
                            </Text>
                            <div className="flex flex-wrap gap-2">
                              {group.slots.map((s, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                                >
                                  {s.startTime} - {s.endTime}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Stethoscope className="h-4 w-4" />
                    <Text className="text-sm">Patients will see these slots on booking screen.</Text>
                  </div>
                  <button
                    onClick={() => setEditSlot(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Edit Slots
                  </button>
                </div>
              </div>
            </VerticalContainer>
          </Card>
        )}
      </div>
    </div>
  );
}

