"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type PatientDetails = {
  fullName: string;
  age: string;
  gender: string;
  mobileNumber: string;
  weight: string;
  problem: string;
  relationship: string;
};

type PatientContextValue = {
  patientDetails: PatientDetails | null;
  setPatientDetails: Dispatch<SetStateAction<PatientDetails | null>>;
  clearPatientDetails: () => void;
};

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);

  const value = useMemo(
    () => ({
      patientDetails,
      setPatientDetails,
      clearPatientDetails: () => setPatientDetails(null),
    }),
    [patientDetails]
  );

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatient() {
  const context = useContext(PatientContext);

  if (!context) {
    throw new Error("usePatient must be used inside PatientProvider");
  }

  return context;
}
