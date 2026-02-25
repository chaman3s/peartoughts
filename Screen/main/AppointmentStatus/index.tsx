"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/Components/ui/Button";
import { useDoctor } from "@/ContextApi/doctorContext";
import DoctorHeader from "../DoctorHeader";
import { useNavigate } from "@/utils";
import AddToCalendarScreen from "../AddToCalendar";

const SUCCESS_STATUSES = ["success", "successful", "active", "confirmed"] as const;

export default function AppointmentStatus() {
  const { doctor } = useDoctor();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const [showCalendor, setShowCalendor] = useState(false);

  const isSuccessful = useMemo(() => {
    const rawStatus = searchParams.get("status")?.trim().toLowerCase() ?? "success";
    return SUCCESS_STATUSES.includes(rawStatus as (typeof SUCCESS_STATUSES)[number]);
  }, [searchParams]);

  const handleAddToCalendar = () => {
    navigate("/dashBoard/AddToCalendar");
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

        {isSuccessful ? (
          <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_38px_-26px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-lg font-semibold text-slate-500">Appointment Number:</p>
                <p className="text-3xl font-bold leading-tight text-slate-900">#34</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-500">Status</p>
                  <p className="text-2xl font-semibold text-green-600">{doctor.status}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-500">Reporting Time</p>
                  <p className="text-xl font-semibold text-slate-900">{doctor.appointmentDate}</p>
                  <p className="text-xl font-semibold text-slate-900">{doctor.appointmentTime}</p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={()=>setShowCalendor((p)=>!p)}
              className="w-fit rounded-2xl bg-cyan-100 px-6 py-3 text-base font-semibold text-cyan-600 hover:bg-cyan-200"
            >
              Add to calendar
            </Button>
            {
                showCalendor&&(
                    <AddToCalendarScreen/>
                )
            }
            <div className="pt-1">
              <p className="text-lg font-semibold text-slate-900">Add Patient Details</p>
              <Button
                type="button"
                className="mt-3 rounded-2xl border border-cyan-400 bg-white px-6 py-3 text-base font-semibold text-cyan-500 hover:bg-cyan-50"
              >
                + Add Patient Details
              </Button>
            </div>

            <Button
              type="button"
              onClick={() => navigate("/dashBoard")}
              className="mt-12 w-full rounded-2xl bg-cyan-500 py-4 text-xl font-semibold text-white hover:bg-cyan-600"
            >
              View My Appointment
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_38px_-26px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="rounded-3xl bg-rose-100 p-5 text-lg leading-relaxed text-slate-600">
              Sorry apt slot/consulting time is over. Would you like to make appointment with the next available slot?
            </div>

            <Button
              type="button"
              onClick={() => navigate("/dashBoard/BookAppointment")}
              className="w-full rounded-2xl bg-cyan-500 py-4 text-xl font-semibold text-white hover:bg-cyan-600"
            >
              Yes
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
