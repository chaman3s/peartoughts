"use client";

import Text from "@/Components/ui/Text";
import { Card } from "@/Components/ui/Card";
import { VerticalContainer } from "@/Components/ui/Container";
import Select from "@/Components/ui/Select";
import { useMemo, useState } from "react";
import TokenAutoComplete from "@/Components/ui/Select/TokenAutoComplete";
import ScheduleTable from "@/Components/ScheduleTable";
import type { PersistedSlotSettings, SlotCustomGroup, SlotTimeType } from "@/types/slotSettings";

export type SlotSettings = PersistedSlotSettings;

type Props = {
  value: SlotSettings;
  onChange: (data: SlotSettings) => void;
  onsubmit: (open: boolean, payload?: SlotSettings) => void;
};

const dayOptions = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

const weekView = [
  { value: "mon", shortLabel: "Mon" },
  { value: "tue", shortLabel: "Tue" },
  { value: "wed", shortLabel: "Wed" },
  { value: "thu", shortLabel: "Thu" },
  { value: "fri", shortLabel: "Fri" },
  { value: "sat", shortLabel: "Sat" },
  { value: "sun", shortLabel: "Sun" },
];

const dayPresets: Record<string, string[]> = {
  all: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  working: ["mon", "tue", "wed", "thu", "fri"],
  weekend: ["sat", "sun"],
  twf: ["tue", "wed", "fri"],
};

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayPresetKey(days: string[]) {
  const normalize = (arr: string[]) => [...arr].sort().join(",");
  const current = normalize(days);
  const matched = Object.entries(dayPresets).find(([, presetDays]) => normalize(presetDays) === current);
  return matched?.[0] ?? "custom";
}

export default function SlotForm({ value, onChange, onsubmit }: Props) {
  const [days, setDays] = useState<string[]>(value.days);
  const [dayPreset, setDayPreset] = useState<string>(getDayPresetKey(value.days));
  const [isCustomDays, setIsCustomDays] = useState(getDayPresetKey(value.days) === "custom");
  const [timePreset, setTimePreset] = useState<SlotTimeType>(value.timeType);
  const [scheduleRows, setScheduleRows] = useState<SlotCustomGroup[]>(value.customSlots);
  const [slotDuration, setSlotDuration] = useState<number>(value.slotDuration);
  const [slotPrice, setSlotPrice] = useState<number>(value.slotPrice);
  const [startDate, setStartDate] = useState<string>(value.startDate ?? toLocalIsoDate(new Date()));
  const selectedDaysCount = useMemo(() => days.length, [days]);

  const handleDayPreset = (preset: string) => {
    setDayPreset(preset);
    if (preset === "custom") {
      setIsCustomDays(true);
      setDays([]);
      return;
    }

    setIsCustomDays(false);
    setDays(dayPresets[preset] ?? []);
  };

  const handleScheduleChange = (rows: SlotCustomGroup[]) => {
    setScheduleRows(rows);
    if (rows.length > 0 && timePreset !== "custom") {
      setTimePreset("custom");
    }
  };

  const toggleDay = (day: string) => {
    setIsCustomDays(true);
    setDayPreset("custom");
    setDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = () => {
    const payload: SlotSettings = {
      ...value,
      days,
      timeType: timePreset,
      customSlots: timePreset === "custom" ? scheduleRows : [],
      startDate,
      slotDuration: Number.isFinite(slotDuration) && slotDuration > 0 ? slotDuration : 15,
      slotPrice: Number.isFinite(slotPrice) && slotPrice >= 0 ? slotPrice : 0,
    };

    onChange(payload);
    onsubmit(false, payload);
  };

  return (
    <Card>
      <VerticalContainer>
        <div className="space-y-6 p-5 md:p-8">
          <div className="space-y-1">
            <Text as="h1" className="text-2xl font-semibold text-slate-900">
              Slot Allocation
            </Text>
            <Text className="text-sm text-slate-500">
              Configure available days, timing, and fees in one place.
            </Text>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 md:p-5">
            <Text className="mb-3 text-sm font-medium text-slate-700">
              Start date
            </Text>
            <input
              type="date"
              value={startDate}
              min={toLocalIsoDate(new Date())}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDayPreset("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  dayPreset === "all"
                    ? "bg-cyan-600 text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Whole week
              </button>
              <button
                type="button"
                onClick={() => handleDayPreset("working")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  dayPreset === "working"
                    ? "bg-cyan-600 text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Mon-Fri
              </button>
              <button
                type="button"
                onClick={() => handleDayPreset("weekend")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  dayPreset === "weekend"
                    ? "bg-cyan-600 text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Weekend
              </button>
              <button
                type="button"
                onClick={() => handleDayPreset("custom")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  dayPreset === "custom"
                    ? "bg-cyan-600 text-white"
                    : "bg-white text-slate-600"
                }`}
              >
                Custom
              </button>
            </div>

            <Text className="mb-3 text-sm font-medium text-slate-700">
              Calendar view (select available days)
            </Text>
            <div className="grid grid-cols-7 gap-2">
              {weekView.map((day) => {
                const active = days.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`rounded-xl border px-2 py-3 text-center text-sm font-semibold transition ${
                      active
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {day.shortLabel}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{selectedDaysCount} day(s) selected</span>
              <button
                type="button"
                onClick={() => handleDayPreset("all")}
                className="font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCustomDays(true);
                  setDayPreset("custom");
                  setDays([]);
                }}
                className="font-semibold text-rose-600 hover:text-rose-700"
              >
                Clear
              </button>
            </div>

            {isCustomDays && (
              <div className="mt-4">
                <TokenAutoComplete
                  options={dayOptions}
                  value={days}
                  onChange={(nextDays) => {
                    setDays(nextDays);
                    setDayPreset("custom");
                  }}
                  placeholder="Search days..."
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 md:p-5">
            <Text className="mb-3 text-sm font-medium text-slate-700">
              Time configuration
            </Text>
            <Select
              placeholder="Select time range"
              value={timePreset}
              onChange={(next) => setTimePreset(next as SlotTimeType)}
              options={[
                { label: "24 hours", value: "24" },
                { label: "Office (9-17)", value: "office" },
                { label: "Morning (6-14)", value: "morning" },
                { label: "Evening (14-22)", value: "evening" },
                { label: "Custom", value: "custom" },
              ]}
            />

            {timePreset === "custom" && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <ScheduleTable onChange={handleScheduleChange} allowedDays={days} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 md:p-5">
            <Text className="mb-3 text-sm font-medium text-slate-700">
              Slot details
            </Text>
            <div className="grid max-w-md grid-cols-2 gap-4">
              <div>
                <Text className="mb-1 text-sm font-medium text-slate-600">Slot duration (min)</Text>
                <input
                  type="number"
                  min={1}
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <Text className="mb-1 text-sm font-medium text-slate-600">Slot price</Text>
                <input
                  type="number"
                  min={0}
                  value={slotPrice}
                  onChange={(e) => setSlotPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => onsubmit(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-cyan-600 px-5 py-2 font-semibold text-white hover:bg-cyan-700"
            >
              Save Slots
            </button>
          </div>
        </div>
      </VerticalContainer>
    </Card>
  );
}
