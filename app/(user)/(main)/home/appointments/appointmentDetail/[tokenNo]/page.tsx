"use client";

import AppointmentDetailScreen from "@/Screen/user/main/AppointmentDetailScreen";
import { useAppointment } from "@/ContextApi/appointmentContext";
import { useDoctor } from "@/ContextApi/doctorContext";
import { usePatient } from "@/ContextApi/patientContext";
import { useParams } from "next/navigation";

export default function AppointmentDetailPage() {
    const { appointments } = useAppointment();
    const { doctor } = useDoctor();
    const { patientDetails } = usePatient();
    const params = useParams();
    const { tokenNo } = params;

    const appointment = appointments.find((item) => item.tokenNo === Number(tokenNo));

    if (!appointment || !patientDetails) {
        return <div>Appointment not found</div>;
    }

    const data = {
        tokenNo: appointment.tokenNo,
        doctorName: doctor.doctorName,
        doctorImage: doctor.doctorImage,
        specialization: doctor.specialist,
        doctorDegree: doctor.doctorDegree,
        status: appointment.status,
        patientName: patientDetails.fullName,
        patientAge: patientDetails.age,
        patientWeight: patientDetails.weight,
        patientProblem: patientDetails.problem,
        consultingTime: `${appointment.dayLabel} ${appointment.time}`,
    };

    return <AppointmentDetailScreen data={data} />;
}
