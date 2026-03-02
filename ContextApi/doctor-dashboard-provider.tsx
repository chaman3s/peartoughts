"use client";

import type { ReactNode } from "react";
import { DoctorProvider, type DoctorHeaderData } from "@/ContextApi/doctorContext";
import { PatientProvider } from "@/ContextApi/patientContext";
import { AppointmentProvider } from "@/ContextApi/appointmentContext";

const doctorData: DoctorHeaderData = {
  status: "Available Today",
  doctorName: "Dr. Kumar Das",
  specialist: "Ophthalmologist",
  doctorDegree: "MBBS, MS (Surgeon)",
  clinicLocation: "Fellow of Sanskar Netralaya, Chennai",
  doctorImage: "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg",
  appointmentDate: "Oct 27, 2023",
  appointmentTime: "7:30 PM",
  stats: [
    {
      id: "patients",
      value: "5,000+",
      label: "patients",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
          <path
            d="M16 11c1.66 0 3-1.57 3-3.5S17.66 4 16 4s-3 1.57-3 3.5 1.34 3.5 3 3.5Zm-8 0c1.66 0 3-1.57 3-3.5S9.66 4 8 4 5 5.57 5 7.5 6.34 11 8 11Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.98 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      id: "experience",
      value: "10+",
      label: "years expr.",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
          <path
            d="M17 3h-1V1h-2v2H10V1H8v2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H7V9h10v10Zm-5-2 4-4-1.41-1.41L12 14.17l-1.59-1.58L9 14l3 3Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      id: "rating",
      value: "0",
      label: "rating",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
          <path
            d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      id: "reviews",
      value: "4,942",
      label: "reviews",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-500" aria-hidden="true">
          <path
            d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-9 9H7V9h4v2Zm6 0h-4V9h4v2Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ],
};

export default function DoctorDashboardProvider({ children }: { children: ReactNode }) {
  return (
    <DoctorProvider initialDoctor={doctorData}>
      <PatientProvider>
        <AppointmentProvider>{children}</AppointmentProvider>
      </PatientProvider>
    </DoctorProvider>
  );
}
