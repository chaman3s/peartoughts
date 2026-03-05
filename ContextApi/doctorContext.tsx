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
  clinicName: string;
  clinicLocation: string;
  clinicAddress: string;
  doctorLicenseNo: string;
  doctorImage: string;
  appointmentDate: string;
  appointmentTime: string;
  stats: DoctorStat[];
};

type DoctorContextValue = {
  doctor: DoctorHeaderData;
  setDoctor: Dispatch<SetStateAction<DoctorHeaderData>>;
  updateDoctor: (updates: Partial<DoctorHeaderData>) => void;
};

const DoctorContext = createContext<DoctorContextValue | null>(null);

type DoctorProviderProps = {
  children: ReactNode;
  initialDoctor: DoctorHeaderData;
};

export function DoctorProvider({ children, initialDoctor }: DoctorProviderProps) {
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

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>;
}

export function useDoctor() {
  const context = useContext(DoctorContext);

  if (!context) {
    throw new Error("useDoctor must be used inside DoctorProvider");
  }

  return context;
}
