"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDoctor } from "@/ContextApi/DoctorProfileContext";
import DoctorHeader from "@/Components/DoctorHeader";
import SlotForm, { SlotSettings } from "./SlotForm";
import { Card } from "@/Components/ui/Card";
import { VerticalContainer } from "@/Components/ui/Container";
import Text from "@/Components/ui/Text";

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
  office: "Office (9–17)",
  morning: "Morning (6–14)",
  evening: "Evening (14–22)",
};

/* ---------------- HELPERS ---------------- */

const ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WORKING_DAYS = ["mon", "tue", "wed", "thu", "fri"];
const WEEKENDS = ["sat", "sun"];

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const as = [...a].sort().join(",");
  const bs = [...b].sort().join(",");
  return as === bs;
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
    return `${allSlots[0].start} – ${allSlots[0].end}`;
  }

  const startTimes = allSlots.map((s) => s.start).sort();
  const endTimes = allSlots.map((s) => s.end).sort();

  return `${startTimes[0]} – ${endTimes[endTimes.length - 1]}`;
}

/* ---------------- COMPONENT ---------------- */

export default function DoctorProfile() {
  const { doctor } = useDoctor();
  const [editSlot, setEditSlot] = useState(true);

  const [slotSetting, setSlotSetting] = useState<SlotSettings>({
    days: ["mon", "tue", "wed", "thu", "fri"],
    timeType: "custom",
    customSlots: [],
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

  useEffect(() => {
    console.log("last data:", slotSetting);
  }, [slotSetting]);

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      {/* Header */}
      <div className="mt-5">
        <DoctorHeader
          specialTitle={{ value: "Edit Profile", onClick: () => {} }}
          status={doctor.status}
          doctorName={doctor.doctorName}
          specialist={doctor.specialist || "not defined"}
          doctorDegree={doctor.doctorDegree || "not defined"}
          clinicLocation={doctor.clinicLocation || "not defined"}
          doctorImage={doctor.doctorImage}
          stats={doctor.stats || []}
        />
      </div>

      {/* Body */}
      <div className="mt-5 m-2.5">
        {editSlot ? (
          <SlotForm
            value={slotSetting}
            onChange={setSlotSetting}
            onsubmit={() => setEditSlot(false)}
          />
        ) : (
          <Card>
            <VerticalContainer>
              <div className="p-6 space-y-6">
                <Text as="h2" className="text-xl font-semibold">
                  Slot Summary
                </Text>

                {/* ---------------- DAYS ---------------- */}
                <div>
                  <Text className="text-sm text-gray-500 mb-2">
                    Days
                  </Text>

                  {!slotSetting.days?.length ? (
                    <span className="text-gray-400 text-sm">
                      Not set
                    </span>
                  ) : daySummaryLabel ? (
                    <Text className="font-medium">
                      {daySummaryLabel}
                    </Text>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slotSetting.days.map((d) => (
                        <span
                          key={d}
                          className="px-3 py-1 rounded-full bg-gray-100 text-sm"
                        >
                          {dayLabelMap[d] ?? d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ---------------- TIME RANGE ---------------- */}
                <div>
                  <Text className="text-sm text-gray-500 mb-2">
                    Time Range
                  </Text>

                  {slotSetting.timeType !== "custom" ? (
                    <Text className="font-medium">
                      {timeSummaryLabel}
                    </Text>
                  ) : slotSetting.customSlots.length === 0 ? (
                    <Text className="text-gray-400 text-sm">
                      Not set
                    </Text>
                  ) : (
                    <div className="space-y-3">
                      {slotSetting.customSlots.map((group) => (
                        <div
                          key={group.id}
                          className="p-3 rounded-lg bg-gray-50 border"
                        >
                          {/* group days */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {group.days.map((d) => (
                              <span
                                key={d}
                                className="px-2 py-0.5 text-xs rounded-full bg-white border"
                              >
                                {dayLabelMap[d] ?? d}
                              </span>
                            ))}
                          </div>

                          {/* group slots */}
                          <div className="flex flex-wrap gap-2">
                            {group.slots.map((s, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-md bg-gray-200 text-sm"
                              >
                                {s.startTime} – {s.endTime}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ---------------- DURATION + PRICE ---------------- */}
                <div className="grid grid-cols-2 gap-6 max-w-md">
                  <div>
                    <Text className="text-sm text-gray-500 mb-1">
                      Slot Duration
                    </Text>
                    <Text className="font-medium">
                      {slotSetting.slotDuration} minutes
                    </Text>
                  </div>

                  <div>
                    <Text className="text-sm text-gray-500 mb-1">
                      Slot Price
                    </Text>
                    <Text className="font-medium">
                      ₹{slotSetting.slotPrice}
                    </Text>
                  </div>
                </div>

                <button
                  onClick={() => setEditSlot(true)}
                  className="px-4 py-2 border rounded-md w-fit hover:bg-gray-50"
                >
                  Edit Slots
                </button>
              </div>
            </VerticalContainer>
          </Card>
        )}
      </div>
    </div>
  );
}