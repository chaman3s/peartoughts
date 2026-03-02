"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type DoctorStat = {
  id: string;
  value: string;
  label: string;
  icon: ReactNode;
};

export type DoctorHeaderData = {
  status: string;
  doctorName: string;
  specialist: string;
  doctorDegree: string;
  clinicLocation: string;
  doctorEmail: string;
  doctorPhone: number;
  doctorImage: string;
  appointmentDate:[];
  appointmentTime: [];
  stats: DoctorStat[];
};

const defaultDoctor: DoctorHeaderData = {
  status: "online",
  doctorName: "Dr. Evelyn Reed",
  specialist: "Pediatrician",
  doctorDegree: "M.D., F.A.A.P.",
  clinicLocation: "123 Wellness Way, Suite 101, Healtheville, ST 12345",
  doctorEmail: "dr.evelyn.reed@example.com",
  doctorPhone: 1234567890,
  doctorImage: "https://via.placeholder.com/150",
  appointmentDate: [],
  appointmentTime: [],
  stats: [
    { id: "1", value: "1500+", label: "Patients Treated", icon: null },
    { id: "2", value: "12", label: "Years of Experience", icon: null },
    { id: "3", value: "0", label: "Average Rating", icon: null },
    { id: "4", value: "4,942", label: "Reviews", icon: null },
  ],
};

type DoctorContextValue = {
  doctor: DoctorHeaderData;
  setDoctor: Dispatch<SetStateAction<DoctorHeaderData>>;
  updateDoctor: (updates: Partial<DoctorHeaderData>) => void;
};

const DoctorProfileContext = createContext<DoctorContextValue | null>(null);

type DoctorProviderProps = {
  children: ReactNode;
  initialDoctor?: DoctorHeaderData;
};

export function DoctorProfileProvider({ children, initialDoctor = defaultDoctor }: DoctorProviderProps) {
  const [doctor, setDoctor] = useState<DoctorHeaderData>(initialDoctor);

  const updateDoctor = useCallback((updates: Partial<DoctorHeaderData>) => {
    setDoctor((prev) => ({ ...prev, ...updates }));
  }, []);

  const value = useMemo(
    () => ({
      doctor,
      setDoctor,
      updateDoctor,
    }),
    [doctor, updateDoctor]
  );

  return <DoctorProfileContext.Provider value={value}>{children}</DoctorProfileContext.Provider>;
}

export function useDoctor() {
  const context = useContext(DoctorProfileContext);

  if (!context) {
    throw new Error("useDoctor must be used inside DoctorProvider");
  }

  return context;
}
