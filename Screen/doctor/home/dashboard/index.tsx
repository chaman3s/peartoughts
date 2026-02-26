"use client";
import React from "react";
import  Sidebar  from "@/Components/sideBar";
import { useDoctor } from "@/ContextApi/doctorContext";
import { useSidebar } from "@/ContextApi/sidebar-context";
import Link from "next/link";
import { HorizontalContainer,VerticalContainer } from "@/Components/ui/Container";
import DoctorProfile from "../Profile";

export default function DoctorDashbord() {
  const { doctor } = useDoctor();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <HorizontalContainer>
      <VerticalContainer>
        <header className="p-4 bg-white shadow-md">
          <button onClick={toggleSidebar} className="md:hidden">
            {isSidebarOpen ? "Close" : "Open"} Sidebar
          </button>
          <h1 className="text-2xl font-bold">{doctor.doctorName}</h1>
          <p>{doctor.specialist}</p>
        </header>
        <main className="p-4">
          <DoctorProfile />
        </main>
      </VerticalContainer>
    </HorizontalContainer>
  );
}
