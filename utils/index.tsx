import type { Dispatch, SetStateAction } from "react";
import type { DoctorHeaderData } from "@/ContextApi/doctorContext";

export type DoctorCard = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  description: string;
  tags: string[];
  availableToday: boolean;
};

type RouterLike = {
  push: (href: string) => void;
};

export const setDoctorContextAndNavigate = (
  doctor: DoctorCard,
  pageUrl: string,
  setDoctor: Dispatch<SetStateAction<DoctorHeaderData>>,
  router: RouterLike
) => {
  setDoctor((prev) => ({
    ...prev,
    status: doctor.availableToday ? "Available Today" : "Available by Appointment",
    doctorName: doctor.name,
    specialist: doctor.specialty,
    doctorDegree: "MBBS, MD",
    clinicLocation: "City Care Clinic",
    doctorImage: "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
    stats: prev.stats.map((stat) => {
      if (stat.id === "experience") return { ...stat, value: doctor.experience, label: "experience" };
      if (stat.id === "rating") return { ...stat, value: doctor.rating, label: "rating" };
      return stat;
    }),
  }));

  router.push(pageUrl);
};
