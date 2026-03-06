"use client";
import { setDoctorContextAndNavigate, useNavigate } from "@/utils";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Card } from "@/Components/ui/Card";
import Button from "@/Components/ui/Button";
import Image from "@/Components/ui/Image";
import { useDoctor } from "@/ContextApi/doctorContext";
import { useDoctors } from "@/hooks/useDoctors";

type DoctorCard = {
  id: string;
  doctorImage:string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  description: string;
  tags: string[];
  availableToday: boolean;
  doctorEmail?: string;
};

const filterTags = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Neurologist",
  "Dentist",
  "Available Today",
] as const;

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { setDoctor } = useDoctor();
  const [activeTag, setActiveTag] = useState<(typeof filterTags)[number]>("All");
  const doctors = useDoctors()
  console.log("doctordata",doctors)
  const getStars = (rating: string) => "\u2605".repeat(Math.round(Number(rating)));

  const filteredDoctors = useMemo(() => {
    if (activeTag === "All") return doctors;
    if (activeTag === "Available Today") {
      return doctors.filter((doctor) => doctor.availableToday);
    }
    return doctors.filter((doctor) => doctor.specialty === activeTag);
  }, [activeTag, doctors]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
     

      <section className="mx-auto max-w-[1600px] px-4 py-5 md:px-6">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {filterTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTag === tag ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor, index) => (
            <Card
              key={`${doctor.id}-${index}`}
              className="overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-sm"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <Image src={doctor.doctorImage} alt={doctor.name} fill className="object-cover  object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-xs text-white">{doctor.specialty}</p>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h2 className="text-base font-semibold leading-snug">{doctor.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">{doctor.experience} experience</p>
                </div>

                <p className="text-sm text-slate-600">{doctor.description}</p>

                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">Rating</p>
                  <p className="text-sm font-semibold text-amber-500">{getStars(doctor.rating)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {doctor.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setDoctorContextAndNavigate(doctor, "/home/dashBoard/DoctorDetail", setDoctor, navigate)} className="flex-1 border border-slate-300 bg-white text-slate-800 hover:bg-slate-100">View More</Button>
                  <Button onClick={() => setDoctorContextAndNavigate(doctor, "/home/dashBoard/BookAppointment", setDoctor, navigate)} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">Book Appointment</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No doctors found for this tag.</p>
        )}
      </section>
    </main>
  );
}
