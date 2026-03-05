"use client"
import { Calendar, Play, User, Stethoscope, Video, ClipboardCheck } from "lucide-react";
import clsx from "clsx";
import LoginNavBar from "@/Components/Nav/authNavbar";
import { useNavigate } from "@/utils";
const stats = [
  { value: "2,500+", label: "Doctors" },
  { value: "1.2M+", label: "Patients" },
  { value: "150K+", label: "Appointments" },
  { value: "150+", label: "Hospitals" },
];

export default function LadingPage() {
    const navigate= useNavigate()
  return (
    <>
    <LoginNavBar/>
    <section className="w-full  bg-white py-2 px-6 mb-1">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="-ml-4 inline-flex  bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-medium mb-6">
            ⭐ Trusted by 1.2M+ Indians
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight mb-6">
            Your Health,
            <br />
            <span className="text-blue">Our Priority</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mb-8">
            Book appointments with India's top doctors instantly. Get quality
            healthcare from the comfort of your home with our secure,
            user-friendly platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="flex items-center justify-between gap-6 bg-emerald-600 text-white px-6 py-5 rounded-2xl min-w-[260px] shadow-lg hover:shadow-xl transition" onClick={()=>navigate("/login")} >
              <div className="flex items-center gap-3">
                <User />
                <div className="text-left" >
                  <p className="text-sm opacity-90"  >Patient Portal</p>
                  <p className="font-semibold text-lg">Login as User</p>
                </div>
              </div>
              <span className="text-xl">→</span>
            </button>
            <button className="flex items-center justify-between gap-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-5 rounded-2xl min-w-[260px] shadow-lg hover:shadow-xl transition" onClick={()=>navigate("/doctor/login")}>
              <div className="flex items-center gap-3">
                <Stethoscope />
                <div className="text-left" >
                  <p className="text-sm opacity-90">Medical Portal</p>
                  <p className="font-semibold text-lg" >Login as Doctor</p>
                </div>
              </div>
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="w-[380px] h-[320px] rounded-3xl bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center shadow-inner">
            <div className="w-[260px] h-[220px] rounded-2xl bg-blue-400/40 flex items-center justify-center">
              <Stethoscope size={80} className="text-blue-700" />
            </div>
          </div>
          <div className="absolute -top-4 right-10 bg-white p-3 rounded-full shadow">
            <Stethoscope className="text-blue-600" />
          </div>
          <div className="absolute left-6 top-1/2 bg-green-100 p-3 rounded-full shadow">
            <Video className="text-green-600" />
          </div>
          <div className="absolute bottom-0 left-24 bg-white p-3 rounded-full shadow">
            <ClipboardCheck className="text-blue-600" />
          </div>
        </div>
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        {stats.map((item) => (
          <div key={item.label}>
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900">
              {item.value}
            </h3>
            <p className="text-gray-600 mt-2 text-lg">{item.label}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
    </>
  );
}

