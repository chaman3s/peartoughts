"use client";

import React, { useState } from "react";
import { useDoctor } from "@/ContextApi/DoctorProfileContext";
import DoctorHeader from "@/Components/DoctorHeader";
import SlotForm from "./SlotForm";

type SlotRow = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
};

type SlotSettings = {
  days: string[];
  timeType: string;
  customSlots: SlotRow[];
  note: string;
};
export default function DoctorProfile() {
  const { doctor } = useDoctor();
  
  const [edit, setEdit] = useState(false);
  const [editSlot,setEditslot ]=useState(false);
 const [slotSetting, setSlotSetting] = useState<SlotSettings>({
  days: [],
  timeType: "",
  customSlots: [],
  note: "",
});


  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <div className="mt-5">
        <DoctorHeader
          specialTitle={{
            value: "Edit Profile",
            onClick: () => setEdit(true),
          }}
          status={doctor.status}
          doctorName={doctor.doctorName}
          specialist={doctor.specialist ? doctor.specialist : "not defined"}
          doctorDegree={doctor.doctorDegree ? doctor.doctorDegree : "not defined"}
          clinicLocation={doctor.clinicLocation ? doctor.clinicLocation : "not defined"}
          doctorImage={doctor.doctorImage}
          stats={doctor.stats ? doctor.stats : []}
        />
      </div>
      <div  className="mt-5 m-2.5">
        {
           <SlotForm
      value={slotSetting}
      onChange={setSlotSetting}
      onsubmit={setEditslot}
    />
        }
       
      </div>
    
    </div>
  );
}