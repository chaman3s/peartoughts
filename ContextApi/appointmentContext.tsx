"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppointmentStatus = "Upcoming" | "Completed" | "Canceled";

export type AppointmentItem = {
  id: string;
  doctorName: string;
  tokenNo: number;
  appointmentDateIso: string;
  dayLabel: string;
  time: string;
  paid: boolean;
  status: AppointmentStatus;
};

type AppointmentContextValue = {
  appointments: AppointmentItem[];
  addAppointment: (appointment: Omit<AppointmentItem, "id" | "tokenNo"> & Partial<Pick<AppointmentItem, "id" | "tokenNo">>) => void;
  cancelAppointment: (appointmentId: string) => void;
};

const AppointmentContext = createContext<AppointmentContextValue | null>(null);

const initialAppointments: AppointmentItem[] = [
  {
    id: "apt-1",
    doctorName: "Dr. Divya Das",
    tokenNo: 12,
    appointmentDateIso: new Date().toISOString().slice(0, 10),
    dayLabel: "Today",
    time: "12:30 PM",
    paid: false,
    status: "Completed",
  },
];

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);

  const addAppointment: AppointmentContextValue["addAppointment"] = (appointment) => {
    setAppointments((prev) => {
      const maxToken = prev.reduce((max, item) => (item.tokenNo > max ? item.tokenNo : max), 0);
      const nextItem: AppointmentItem = {
        id: appointment.id ?? `apt-${Date.now()}`,
        tokenNo: appointment.tokenNo ?? maxToken + 1,
        doctorName: appointment.doctorName,
        appointmentDateIso: appointment.appointmentDateIso,
        dayLabel: appointment.dayLabel,
        time: appointment.time,
        paid: appointment.paid,
        status: appointment.status,
      };
      return [nextItem, ...prev];
    });
  };

  const cancelAppointment: AppointmentContextValue["cancelAppointment"] = (appointmentId) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId && item.status === "Upcoming"
          ? { ...item, status: "Canceled" }
          : item
      )
    );
  };

  const value = useMemo(
    () => ({
      appointments,
      addAppointment,
      cancelAppointment,
    }),
    [appointments]
  );

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
}

export function useAppointment() {
  const context = useContext(AppointmentContext);

  if (!context) {
    throw new Error("useAppointment must be used inside AppointmentProvider");
  }

  return context;
}
