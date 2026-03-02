"use client";

import { useEffect, useState } from "react";
import TokenAutoComplete, {
  Option,
} from "@/Components/ui/Select/TokenAutoComplete";

type TimeSlot = {
  id: number;
  startTime: string;
  endTime: string;
};

type Row = {
  id: number;
  days: string[];
  slots: TimeSlot[];
};

const dayOptions: Option[] = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];
type ScheduleTableProps={
  onChange: (rows: Row[]) => void;
  allowedDays?: string[];
};

export default function ScheduleTable({ onChange, allowedDays }: ScheduleTableProps) {
  const allowedDaySet = new Set((allowedDays ?? []).map((day) => day.trim().toLowerCase()));
  const tableDayOptions =
    allowedDaySet.size > 0
      ? dayOptions.filter((option) => allowedDaySet.has(option.value))
      : dayOptions;
   
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      days: [],
      slots: [{ id: 1, startTime: "", endTime: "" }],
    },

  ]);
   useEffect(()=>{
        onChange(rows)
    },[rows,onChange])

  // update days
  const updateRowDays = (rowId: number, days: string[]) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, days } : row
      )

    );
  };

  // update slot
  const updateSlot = (
    rowId: number,
    slotId: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          slots: row.slots.map((slot) =>
            slot.id === slotId ? { ...slot, [field]: value } : slot
          ),
        };
      })
    );
  };

  // add slot inside row
  const addSlot = (rowId: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              slots: [
                ...row.slots,
                { id: Date.now(), startTime: "", endTime: "" },
              ],
            }
          : row
      )
    );
  };

  // remove slot
  const removeSlot = (rowId: number, slotId: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              slots: row.slots.filter((s) => s.id !== slotId),
            }
          : row
      )
    );
  };

  // add new row
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        days: [],
        slots: [{ id: Date.now(), startTime: "", endTime: "" }],
      },
    ]);
  };

  const removeRow = (rowId: number) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const isInvalid = (start: string, end: string) => {
    if (!start || !end) return false;
    return start >= end;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="overflow-visible rounded-2xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Days</th>
              <th className="px-4 py-3 text-left">Time Slots</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t align-top">
                {/* DAYS */}
                <td className="px-4 py-2 min-w-[240px]">
                  <TokenAutoComplete
                    options={tableDayOptions}
                    value={row.days}
                    onChange={(val) => updateRowDays(row.id, val)}
                    placeholder="Select days..."
                  />
                </td>

                {/* MULTI SLOTS */}
                <td className="px-4 py-2">
                  <div className="space-y-2">
                    {row.slots.map((slot) => {
                      const invalid = isInvalid(
                        slot.startTime,
                        slot.endTime
                      );

                      return (
                        <div
                          key={slot.id}
                          className="flex gap-2 items-start"
                        >
                          <div className="flex-1">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlot(
                                  row.id,
                                  slot.id,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded-lg px-3 py-2"
                            />
                          </div>

                          <div className="flex-1">
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlot(
                                  row.id,
                                  slot.id,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className={`w-full border rounded-lg px-3 py-2 ${
                                invalid ? "border-red-500" : ""
                              }`}
                            />
                          </div>

                          {row.slots.length > 1 && (
                            <button
                              onClick={() =>
                                removeSlot(row.id, slot.id)
                              }
                              className="text-red-500 text-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <button
                      onClick={() => addSlot(row.id)}
                      className="text-blue-600 text-sm font-medium"
                    >
                      + Add time
                    </button>
                  </div>
                </td>

                {/* ROW REMOVE */}
                <td className="px-4 py-2 text-right">
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addRow}
        className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white"
      >
        + Add Schedule Row
      </button>
    </div>
  );
}
