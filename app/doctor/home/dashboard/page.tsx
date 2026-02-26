
"use client"
import DoctorDashbord from "@/Screen/doctor/home/dashboard";
import { DoctorProvider, type DoctorHeaderData } from "@/ContextApi/doctorContext";
import { SidebarProvider } from "@/ContextApi/sidebar-context";


export default function DoctorProfilePage() {
    const initialDoctor: DoctorHeaderData = {
        status: "online",
        doctorName: "Dr. John Doe",
        specialist: "Cardiologist",
        doctorDegree: "M.D.",
        clinicLocation: "123 Main St, Anytown USA",
        doctorImage: "/path/to/image.jpg",
        appointmentDate: "2024-07-27",
        appointmentTime: "10:00 AM",
        stats: [
            { id: "1", value: "120", label: "Patients", icon: null },
            { id: "2", value: "5", label: "Years Exp.", icon: null },
            { id: "3", value: "4.8", label: "Rating", icon: null },
        ],
    };

    return (
        <DoctorProvider initialDoctor={initialDoctor}>
                <DoctorDashbord />
        </DoctorProvider>
    );
}
