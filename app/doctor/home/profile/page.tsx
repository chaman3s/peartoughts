"use client";
import DoctorProfile from "@/Screen/doctor/home/Profile";
import {
  DoctorProvider,
  type DoctorHeaderData,
} from "@/ContextApi/doctorContext";

export default function DoctorProfilePage() {
  const initialDoctor: DoctorHeaderData = {
    status: "online",
    doctorName: "Dr. Evelyn Reed",
    specialist: "Pediatrician",
    doctorDegree: "M.D., F.A.A.P.",
    clinicLocation: "123 Wellness Way, Suite 101, Healtheville, ST 12345",
    doctorImage: "https://via.placeholder.com/150",
    appointmentDate: "2024-08-15",
    appointmentTime: "11:00 AM",
    stats: [
      { id: "1", value: "1500+", label: "Patients Treated", icon: null },
      { id: "2", value: "12", label: "Years of Experience", icon: null },
      { id: "3", value: "4.9/5.0", label: "Average Rating", icon: null },
    ],
  };

  return (
    <DoctorProvider initialDoctor={initialDoctor}>
      <DoctorProfile />
    </DoctorProvider>
  );
}
