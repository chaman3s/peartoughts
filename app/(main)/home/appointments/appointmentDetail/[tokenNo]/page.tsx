"use client";

import Image from "@/Components/ui/Image";
import Button from "@/Components/ui/Button";
import logo from "@/assets/img/logo.jpg";
import { useAppointment, type AppointmentStatus } from "@/ContextApi/appointmentContext";

export default function AppointmentDetailPage({ params }: { params: { tokenNo: string } }) {
    const { appointments, cancelAppointment } = useAppointment();
 const list = appointments.filter((item) =>item.status=== "Upcoming");
 const data = appointments.filter((item)=>item.tokenNo)
 console.log(list)
  return (
    <main className="min-h-screen bg-[#f3f3f3]">
      <section className="mx-auto w-full max-w-md px-4 pb-8 pt-5">
        <div className="space-y-3.5">
          <article className="rounded-xl border border-slate-300 bg-[#ececec] p-3">
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-300">
                <Image src={logo} alt="Dr. Kumar Das" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[30px] font-semibold leading-tight text-slate-800">Dr.Kumar Das</h1>
                <p className="mt-1 border-y border-slate-300 py-1 text-sm text-slate-600">
                  Cardiologist - Dombivali
                </p>
                <p className="mt-1.5 text-sm text-slate-700">MBBS ,MD (Internal Medicine)</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-300 bg-[#ececec] px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[31px] text-slate-700">Appointment Status</p>
              <p className="text-[31px] font-semibold text-cyan-500">Waiting</p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-300 bg-[#ececec] px-4 py-4">
            <p className="text-[28px] text-slate-500">Full name</p>
            <p className="mt-0.5 text-[31px] font-medium text-slate-800">Sudharkar Murti</p>

            <div className="mt-3 flex gap-10">
              <div>
                <p className="text-[28px] text-slate-500">Age</p>
                <p className="text-[31px] font-semibold text-slate-800">28</p>
              </div>
              <div>
                <p className="text-[28px] text-slate-500">Weight</p>
                <p className="text-[31px] font-semibold text-slate-800">28</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[28px] text-slate-500">Problem</p>
              <p className="text-[31px] leading-tight text-slate-800">Stomach pain Feeling unwell and</p>
            </div>
          </article>

          <article className="rounded-xl border border-slate-300 bg-[#ececec] px-4 py-4">
            <p className="text-[28px] text-slate-500">Live Tracking</p>
            <p className="mt-0.5 text-[31px] leading-tight text-slate-800">
              15 Patient Consulting expected consulting time 8:20 PM
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                className="rounded-xl border border-cyan-400 bg-transparent py-2 text-[26px] font-medium text-slate-700 hover:bg-cyan-50"
              >
                Reschedule
              </Button>
              <Button
                type="button"
                className="rounded-xl border border-slate-300 bg-[#f1f1f1] py-2 text-[26px] font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </Button>
            </div>
          </article>

          <article className="px-0.5 pt-1">
            <h2 className="text-[35px] font-semibold text-slate-900">Pyment</h2>
            <p className="mt-1 text-[24px] leading-tight text-slate-500">
              Reduce your waiting time by Paying the consulting fee upfront
            </p>
            <Button
              type="button"
              className="mt-4 w-full rounded-xl bg-cyan-500 py-3 text-[31px] font-semibold text-white hover:bg-cyan-600"
            >
              Make Payment
            </Button>
          </article>
        </div>
      </section>
    </main>
  );
}
