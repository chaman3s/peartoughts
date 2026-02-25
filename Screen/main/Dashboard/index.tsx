"use client";
import { setDoctorContextAndNavigate, useNavigate } from "@/utils";
import { useMemo, useState } from "react";
import { Card } from "@/Components/ui/Card";
import Button from "@/Components/ui/Button";
import Image from "@/Components/ui/Image";
import logo from "@/assets/img/logo.jpg";
import { useDoctor } from "@/ContextApi/doctorContext";

type DoctorCard = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  description: string;
  tags: string[];
  availableToday: boolean;
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

const doctors: DoctorCard[] = [
  {
    id: "doc-1",
    name: "Dr. Amelia Clark",
    specialty: "Cardiologist",
    experience: "12 years",
    rating: "4.9",
    description: "Specialist in heart rhythm disorders and preventive cardiac care.",
    tags: ["Heart Care", "Online", "Top Rated"],
    availableToday: true,
  },
  {
    id: "doc-2",
    name: "Dr. Noah Rivera",
    specialty: "Dermatologist",
    experience: "9 years",
    rating: "4.8",
    description: "Expert for acne, eczema, and laser-based skin treatment plans.",
    tags: ["Skin", "Clinic Visit", "Fast Booking"],
    availableToday: true,
  },
  {
    id: "doc-3",
    name: "Dr. Sophia Nguyen",
    specialty: "Pediatrician",
    experience: "10 years",
    rating: "4.9",
    description: "Child specialist focused on newborn care and vaccination programs.",
    tags: ["Kids", "Friendly", "Evening Slot"],
    availableToday: false,
  },
  {
    id: "doc-4",
    name: "Dr. Ethan Brooks",
    specialty: "Neurologist",
    experience: "15 years",
    rating: "4.7",
    description: "Consultation for migraine, seizure disorders, and nerve pain care.",
    tags: ["Neuro", "In Person", "Premium"],
    availableToday: false,
  },
  {
    id: "doc-5",
    name: "Dr. Mia Patel",
    specialty: "Dentist",
    experience: "8 years",
    rating: "4.8",
    description: "Dental cleanups, smile correction, and painless root canal treatment.",
    tags: ["Dental", "Weekend", "Popular"],
    availableToday: true,
  },
  {
    id: "doc-6",
    name: "Dr. Lucas Hall",
    specialty: "General Physician",
    experience: "11 years",
    rating: "4.6",
    description: "Primary care for fever, infection, and routine annual health checks.",
    tags: ["General", "Quick Consult", "Available"],
    availableToday: true,
  },
];

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { setDoctor } = useDoctor();
  const [activeTag, setActiveTag] = useState<(typeof filterTags)[number]>("All");
  const getStars = (rating: string) => "\u2605".repeat(Math.round(Number(rating)));

  const filteredDoctors = useMemo(() => {
    if (activeTag === "All") return doctors;
    if (activeTag === "Available Today") {
      return doctors.filter((doctor) => doctor.availableToday);
    }
    return doctors.filter((doctor) => doctor.specialty === activeTag);
  }, [activeTag]);

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
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-sm">
              <div className="relative h-44 w-full overflow-hidden">
                <Image src={logo} alt={doctor.name} fill className="object-cover" />
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
