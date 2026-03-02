"use client";

import Text from "@/Components/ui/Text";
import { Card } from "@/Components/ui/Card";
import { VerticalContainer } from "@/Components/ui/Container";
import Select from "@/Components/ui/Select";
import { useState } from "react";
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

const dayPresets: Record<string, string[]> = {
  all: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  working: ["mon", "tue", "wed", "thu", "fri"],
  weekend: ["sat", "sun"],
  twf: ["tue", "wed", "fri"],
};

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

  const handleSubmit = () => {
    const payload: SlotSettings = {
      ...value,
      days,
      timeType: timePreset,
      customSlots: timePreset === "custom" ? scheduleRows : [],
      slotDuration: Number.isFinite(slotDuration) && slotDuration > 0 ? slotDuration : 15,
      slotPrice: Number.isFinite(slotPrice) && slotPrice >= 0 ? slotPrice : 0,
    };

    onChange(payload);
    onsubmit(false, payload);
  };

  return (
    <Card>
      <VerticalContainer>
        <div className="p-8 space-y-6">
          <Text as="h1" className="text-2xl font-semibold">
            Slot Allocation Form
          </Text>

          <Select
            placeholder="Choose preset"
            value={dayPreset}
            onChange={handleDayPreset}
            options={[
              { label: "Whole week", value: "all" },
              { label: "Working days (Mon-Fri)", value: "working" },
              { label: "Weekends only", value: "weekend" },
              { label: "Tue Wed Fri", value: "twf" },
              { label: "Custom", value: "custom" },
            ]}
          />

          {isCustomDays && (
            <TokenAutoComplete
              options={dayOptions}
              value={days}
              onChange={(nextDays) => {
                setDays(nextDays);
                setDayPreset("custom");
              }}
              placeholder="Search days..."
            />
          )}

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
            <div className="rounded-xl border p-4 bg-gray-50">
              <ScheduleTable onChange={handleScheduleChange} allowedDays={days} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 max-w-md">
            <div>
              <Text className="text-sm font-medium mb-1">Slot duration</Text>
              <input
                type="number"
                min={1}
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <Text className="text-sm font-medium mb-1">Slot price</Text>
              <input
                type="number"
                min={0}
                value={slotPrice}
                onChange={(e) => setSlotPrice(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

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
