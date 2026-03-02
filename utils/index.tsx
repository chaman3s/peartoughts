"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import type { DoctorHeaderData } from "@/ContextApi/doctorContext";

export type DoctorCard = {
  id: string;
  doctorImage: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  description: string;
  tags: string[];
  availableToday: boolean;
  doctorEmail?: string;
};

type NavigateFn = (pageUrl: string) => void;

export function useNavigate() {
  const router = useRouter();

  return useCallback((pageUrl: string) => {
    router.push(pageUrl);
  }, [router]);
}

export const setDoctorContextAndNavigate = (
  doctor: DoctorCard,
  pageUrl: string,
  setDoctor: Dispatch<SetStateAction<DoctorHeaderData>>,
  navigate: NavigateFn,
  updates?: Partial<DoctorHeaderData>
) => {
  setDoctor((prev) => ({
    ...prev,
    status: doctor.availableToday ? "Available Today" : "Available by Appointment",
    doctorName: doctor.name,
    specialist: doctor.specialty,
    doctorDegree: prev.doctorDegree,
    clinicLocation: prev.clinicLocation,
    doctorImage: doctor.doctorImage || prev.doctorImage,
    stats: prev.stats.map((stat) => {
      if (stat.id === "experience") return { ...stat, value: doctor.experience, label: "experience" };
      if (stat.id === "rating") return { ...stat, value: doctor.rating, label: "rating" };
      return stat;
    }),
    ...updates,
  }));

  navigate(pageUrl);
};
