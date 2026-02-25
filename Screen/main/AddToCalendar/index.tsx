"use client";

import { useMemo, useState } from "react";
import Button from "@/Components/ui/Button";
import Image from "@/Components/ui/Image";
import { useDoctor } from "@/ContextApi/doctorContext";
import { useNavigate } from "@/utils";

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
const calendarDays = Array.from({ length: 31 }, (_, index) => index + 1);
const hourSlots = [
  "09.00 AM",
  "09.30 AM",
  "10.00 AM",
  "10.30 PM",
  "11.00 PM",
  "11.30 PM",
  "15.00 PM",
  "15.30 PM",
  "16.00 PM",
  "16.30 PM",
  "17.00 PM",
  "17.30 PM",
] as const;

export default function AddToCalendarScreen() {
  const { doctor, setDoctor } = useDoctor();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(doctor.appointmentDate.match(/\d+/)?.[0] ?? "27");
  const [selectedHour, setSelectedHour] = useState(doctor.appointmentTime.replace(":", "."));

  const profileSubtitle = useMemo(() => `${doctor.specialist} - Dombivali`, [doctor.specialist]);

  const handleViewAppointment = () => {
    setDoctor((prev) => ({
      ...prev,
      appointmentDate: `Dec ${selectedDay}, 2022`,
      appointmentTime: selectedHour.replace(".", ":"),
    }));
    navigate("/dashBoard/appointmet-status?status=active");
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-md px-4 pb-8 pt-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashBoard/appointmet-status?status=active")}
              className="grid h-8 w-8 place-items-center rounded-full text-slate-700 hover:bg-slate-100"
              aria-label="Back"
            >
              <span className="text-lg leading-none">&#8592;</span>
            </button>
            <h1 className="text-3xl font-semibold text-slate-800">Add to Calendar</h1>
          </div>

          <div className="rounded-2xl border border-slate-200 p-3">
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                <Image src={doctor.doctorImage} alt={doctor.doctorName} width={80} height={80} className="h-20 w-20 object-cover" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-slate-800">{doctor.doctorName}</p>
                <p className="mt-1 text-sm text-slate-500">{profileSubtitle}</p>
                <p className="mt-2 text-sm text-slate-700">{doctor.doctorDegree}</p>
              </div>
            </div>
          </div>

          <h2 className="mt-5 text-3xl font-semibold text-slate-800">Select Date</h2>
          <div className="mt-3 rounded-3xl bg-slate-100 p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-2xl font-medium text-slate-700">December 2022</p>
              <div className="flex gap-2 text-slate-400">
                <span>&#x2039;</span>
                <span>&#x203A;</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-slate-500">
              {weekDays.map((weekDay) => (
                <p key={weekDay}>{weekDay}</p>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-y-2 text-center">
              {calendarDays.map((day) => {
                const dayText = String(day);
                const isSelected = dayText === selectedDay;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(dayText)}
                    className={`mx-auto h-8 w-8 rounded-full text-sm ${isSelected ? "bg-cyan-500 text-white" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <h2 className="mt-5 text-3xl font-semibold text-slate-800">Select Hour</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {hourSlots.map((slot) => {
              const isSelected = selectedHour === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedHour(slot)}
                  className={`rounded-xl border px-2 py-2 text-base font-medium ${isSelected ? "border-cyan-500 text-cyan-600" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            onClick={handleViewAppointment}
            className="mt-6 w-full rounded-2xl bg-cyan-500 py-3 text-xl font-semibold text-white hover:bg-cyan-600"
          >
            View My Appointment
          </Button>
        </div>
      </section>
    </main>
  );
}
