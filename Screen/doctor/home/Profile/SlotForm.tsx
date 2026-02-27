"use client";

import Text from "@/Components/ui/Text";
import { Card } from "@/Components/ui/Card";
import { VerticalContainer } from "@/Components/ui/Container";
import Select from "@/Components/ui/Select";
import { useEffect, useState } from "react";
import TokenAutoComplete from "@/Components/ui/Select/TokenAutoComplete";
import ScheduleTable from "@/Components/ScheduleTable";

/* ---------------- TYPES ---------------- */

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
  slotDuration: number;
  slotPrice: number;
};

type Props = {
  value: SlotSettings;
  onChange: (data: SlotSettings) => void;
  onsubmit: (open: boolean) => void;
};

/* ---------------- CONSTANTS ---------------- */

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

/* ---------------- COMPONENT ---------------- */

export default function SlotForm({ value, onChange, onsubmit }: Props) {
  const [days, setDays] = useState<string[]>(value.days);
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [timePreset, setTimePreset] = useState<string>(value.timeType);
  const [scheduleRows, setScheduleRows] = useState<SlotRow[]>(
    value.customSlots
  );
  useEffect(()=>{
    console.log("scheduleRows:",scheduleRows)
  },[scheduleRows])

  /* sync */
  useEffect(() => {
    setDays(value.days);
    setTimePreset(value.timeType);
    setScheduleRows(value.customSlots);
  }, [value]);

  /* handlers */

  const handleDayPreset = (preset: string) => {
    if (preset === "custom") {
      setIsCustomDays(true);
      setDays([]);
      return;
    }

    setIsCustomDays(false);
    setDays(dayPresets[preset] ?? []);
  };

  const handleScheduleChange = (rows: SlotRow[]) => {
    console.log("rows:",rows)
    setScheduleRows(rows);

    // ⭐ IMPORTANT: force custom mode when user edits table
    if (rows.length > 0 && timePreset !== "custom") {
      setTimePreset("custom");
    }
  };

  const handleSubmit = () => {
    console.log("days:")

    const payload: SlotSettings = {
      ...value,
      days,
      timeType: timePreset,
      customSlots: timePreset === "custom" ? scheduleRows : [],
    };

    onChange(payload);
    onsubmit(false);

    console.log("FINAL SLOT JSON:", payload);
  };

  return (
    <Card>
      <VerticalContainer>
        <div className="p-8 space-y-6">
          <Text as="h1" className="text-2xl font-semibold">
            Slot Allocation Form
          </Text>

          {/* Days */}
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

          {isCustomDays && (
            <TokenAutoComplete
              options={dayOptions}
              value={days}
              onChange={setDays}
              placeholder="Search days..."
            />
          )}

          {/* Time preset */}
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

          {/* ⭐ Custom table */}
          {timePreset === "custom" && (
            <div className="rounded-xl border p-4 bg-gray-50">
              <ScheduleTable onChange={(rows: SlotRow[])=>handleScheduleChange(rows)} />
            </div>
          )}

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-6 max-w-md">
            <div>
              <Text className="text-sm font-medium mb-1">
                Slot duration
              </Text>
              <input
                type="number"
                value={value.slotDuration}
                onChange={(e) =>
                  onChange({
                    ...value,
                    slotDuration: Number(e.target.value),
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <Text className="text-sm font-medium mb-1">
                Slot price
              </Text>
              <input
                type="number"
                value={value.slotPrice}
                onChange={(e) =>
                  onChange({
                    ...value,
                    slotPrice: Number(e.target.value),
                  })
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onsubmit(false)}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-black text-white rounded-md"
            >
              Save Slots
            </button>
          </div>
        </div>
      </VerticalContainer>
    </Card>
  );
}