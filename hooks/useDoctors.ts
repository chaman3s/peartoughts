
"use client";
import { useSyncExternalStore } from "react";

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

const defaultDoctors: DoctorCard[] = [
  {
    id: "doc-1",
    doctorImage:"https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
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
    doctorImage:"https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
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
    doctorImage:"https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
    name: "Dr. Sophia Nguyen",
    specialty: "Pediatrician",
    experience: "10 years",
    rating: "2",
    description: "Child specialist focused on newborn care and vaccination programs.",
    tags: ["Kids", "Friendly", "Evening Slot"],
    availableToday: false,
  },
  {
    id: "doc-4",
    doctorImage:"https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
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
    doctorImage:"https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
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
    doctorImage:"https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
    name: "Dr. Lucas Hall",
    specialty: "General Physician",
    experience: "11 years",
    rating: "4.6",
    description: "Primary care for fever, infection, and routine annual health checks.",
    tags: ["General", "Quick Consult", "Available"],
    availableToday: true,
  },
];

function toDoctorCard(item: unknown): DoctorCard | null {
    if (
      !item ||
      typeof item !== "object" ||
      !("id" in item) ||
      !("name" in item) ||
      !("specialty" in item) ||
      !("experience" in item) ||
      !("rating" in item) ||
      !("description" in item) ||
      !("tags" in item) ||
      !("availableToday" in item) ||
      !("doctorImage" in item)
    ) {
      return null;
    }
  
    const card: DoctorCard = {
      id: String(item.id),
      name: String(item.name),
      specialty: String(item.specialty),
      experience: String(item.experience),
      rating: String(item.rating),
      description: String(item.description),
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      availableToday: Boolean(item.availableToday),
      doctorImage: String(item.doctorImage),
    };
  
    if ("doctorEmail" in item && typeof item.doctorEmail === "string") {
      card.doctorEmail = item.doctorEmail;
    }
  
    return card;
  }
  
  let cachedDoctorRaw: string | null | undefined;
  let cachedDoctorSnapshot: DoctorCard[] = defaultDoctors;
  
  function getMergedDoctors(): DoctorCard[] {
    if (typeof window === "undefined") return defaultDoctors;
  
    const raw = window.localStorage.getItem("doctor_data");
    if (!raw) return defaultDoctors;
  
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return defaultDoctors;
  
      const storedDoctors = parsed
        .map((item) => toDoctorCard(item))
        .filter((item): item is DoctorCard => item !== null);
  
      if (!storedDoctors.length) return defaultDoctors;
  
      const byKey = new Map<string, DoctorCard>();
      [...defaultDoctors, ...storedDoctors].forEach((item) => {
        const key = item.id;
        byKey.set(key, item);
      });
  
      return Array.from(byKey.values());
    } catch {
      return defaultDoctors;
    }
  }
  
  function getMergedDoctorsSnapshot(): DoctorCard[] {
    if (typeof window === "undefined") return defaultDoctors;
  
    const raw = window.localStorage.getItem("doctor_data");
    if (raw === cachedDoctorRaw) return cachedDoctorSnapshot;
  
    cachedDoctorRaw = raw;
    cachedDoctorSnapshot = getMergedDoctors();
    return cachedDoctorSnapshot;
  }
  
  const subscribeDoctors = () => () => undefined;
  const getServerDoctorsSnapshot = () => defaultDoctors;
  

export function useDoctors() {
    return useSyncExternalStore(
        subscribeDoctors,
        getMergedDoctorsSnapshot,
        getServerDoctorsSnapshot
      );
}
