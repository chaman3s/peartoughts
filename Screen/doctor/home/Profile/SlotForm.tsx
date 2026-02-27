"use client";

import Text from "@/Components/ui/Text";
import { Card } from "@/Components/ui/Card";
import { VerticalContainer } from "@/Components/ui/Container";
import Select from "@/Components/ui/Select";
import { useEffect, useState } from "react";
import TokenAutoComplete from "@/Components/ui/Select/TokenAutoComplete";
import ScheduleTable from "@/Components/ScheduleTable";

/* -------------------- CONSTANTS -------------------- */

const dayOptions = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

const dayPresets: Record<string, string[]> = {
  all: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  working: ["mon", "tue", "wed", "thu", "fri"],
  weekend: ["sat", "sun"],
  twf: ["tue", "wed", "fri"],
};

/* -------------------- TYPES -------------------- */

export type SlotRow = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
};

export type SlotSettings = {
  days: string[];
  timeType: string;
  customSlots: SlotRow[];
  note: string;
};

type Props = {
  value: SlotSettings;
  onChange: (data: SlotSettings) => void;
  onsubmit: (open: boolean) => void; // ✅ FIXED
};

/* -------------------- COMPONENT -------------------- */

export default function SlotForm({ value, onChange, onsubmit }: Props) {
  const [days, setDays] = useState<string[]>(value.days);
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [timePreset, setTimePreset] = useState<string>(value.timeType);
  const [scheduleRows, setScheduleRows] = useState<SlotRow[]>(
    value.customSlots
  );

  const [slotDuration, setSlotDuration] = useState<number>(15);
  const [slotPrice, setSlotPrice] = useState<number>(0);

  const [holiday, setHoliday] = useState<string>("none");
  const [holidayDate, setHolidayDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState(true);

  /* ---------- sync with parent ---------- */
  useEffect(() => {
    setDays(value.days);
    setTimePreset(value.timeType);
    setScheduleRows(value.customSlots);
  }, [value]);

  /* ---------- handlers ---------- */

  const handleDayPreset = (preset: string) => {
    if (preset === "custom") {
      setIsCustomDays(true);
      setDays([]);
      return;
    }

    setIsCustomDays(false);
    setDays(dayPresets[preset] ?? []);
  };

  const handleSubmit = () => {
    const payload: SlotSettings = {
      days,
      timeType: timePreset,
      customSlots: timePreset === "custom" ? scheduleRows : [],
      note: "",
    };

    onChange(payload);
    onsubmit(false); // ✅ close form correctly

    console.log("FORM JSON:", payload);
  };

  return (
    <Card>
      <VerticalContainer>
        <div className="p-8 space-y-6">
          <Text as="h1" className="text-2xl font-semibold">
            Slot Allocation Form
          </Text>

          {/* DAY PRESET */}
          <div className="space-y-2">
            <Text as="label" className="text-sm font-medium">
              Select Days
            </Text>

            <Select
              placeholder="Choose preset"
              onChange={handleDayPreset}
              options={[
                { label: "Whole week", value: "all" },
                { label: "Working days (Mon–Fri)", value: "working" },
                { label: "Weekends only", value: "weekend" },
                { label: "Tue Wed Fri", value: "twf" },
                { label: "Custom", value: "custom" },
              ]}
            />
          </div>

          {/* CUSTOM DAY PICKER */}
          {isCustomDays && (
            <div className="space-y-2">
              <Text as="label" className="text-sm font-medium">
                Choose specific days
              </Text>

              <TokenAutoComplete
                options={dayOptions}
                value={days}
                onChange={setDays}
                placeholder="Search days..."
              />
            </div>
          )}

          {/* TIME PRESET */}
          <div className="space-y-2">
            <Text as="label" className="text-sm font-medium">
              Time Range
            </Text>

            <Select
              placeholder="Select time range"
              onChange={setTimePreset}
              options={[
                { label: "24 hours", value: "24" },
                { label: "Office (9–17)", value: "office" },
                { label: "Morning (6–14)", value: "morning" },
                { label: "Evening (14–22)", value: "evening" },
                { label: "Custom", value: "custom" },
              ]}
            />
          </div>

          {/* CUSTOM SCHEDULE */}
          {timePreset === "custom" && (
            <div className="rounded-xl border p-4 bg-gray-50">
              <ScheduleTable onChange={setScheduleRows} />
            </div>
          )}

          {/* SLOT SETTINGS */}
          <div className="grid grid-cols-2 gap-6 max-w-md">
            <div className="space-y-2">
              <Text as="label" className="text-sm font-medium">
                Slot duration
              </Text>

              <input
                type="number"
                min={5}
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <Text as="label" className="text-sm font-medium">
                Slot price
              </Text>

              <input
                type="number"
                min={0}
                value={slotPrice}
                onChange={(e) => setSlotPrice(Number(e.target.value))}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
              onClick={() => onsubmit(false)} // ✅ FIXED
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-black text-white rounded-md hover:bg-black/90"
            >
              Save Slots
            </button>
          </div>
        </div>
      </VerticalContainer>
    </Card>
  );
}