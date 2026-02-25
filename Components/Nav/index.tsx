"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import logo from "@/assets/img/logo.jpg";
import SearchBar from "../SearchBar";
import { useSidebar } from "../../ContextApi/sidebar-context";
import { isMockAuthenticated } from "@/services/mockAuthApi";

type DoctorCard = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  description: string;
  tags: string[];
  availableToday: boolean;
};

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toggle } = useSidebar();

  const doctors = useMemo<DoctorCard[]>(() => [
    {
      id: "doc-1",
      name: "Dr. Amelia Clark",
      specialty: "Cardiologist",
      experience: "12 years",
      rating: "4.9",
      description:
        "Specialist in heart rhythm disorders and preventive cardiac care.",
      tags: ["Heart Care", "Online", "Top Rated"],
      availableToday: true,
    },
    {
      id: "doc-2",
      name: "Dr. Noah Rivera",
      specialty: "Dermatologist",
      experience: "9 years",
      rating: "4.8",
      description:
        "Expert for acne, eczema, and laser-based skin treatment plans.",
      tags: ["Skin", "Clinic Visit", "Fast Booking"],
      availableToday: true,
    },
    {
      id: "doc-3",
      name: "Dr. Sophia Nguyen",
      specialty: "Pediatrician",
      experience: "10 years",
      rating: "4.9",
      description:
        "Child specialist focused on newborn care and vaccination programs.",
      tags: ["Kids", "Friendly", "Evening Slot"],
      availableToday: false,
    },
    {
      id: "doc-4",
      name: "Dr. Ethan Brooks",
      specialty: "Neurologist",
      experience: "15 years",
      rating: "4.7",
      description:
        "Consultation for migraine, seizure disorders, and nerve pain care.",
      tags: ["Neuro", "In Person", "Premium"],
      availableToday: false,
    },
    {
      id: "doc-5",
      name: "Dr. Mia Patel",
      specialty: "Dentist",
      experience: "8 years",
      rating: "4.8",
      description:
        "Dental cleanups, smile correction, and painless root canal treatment.",
      tags: ["Dental", "Weekend", "Popular"],
      availableToday: true,
    },
    {
      id: "doc-6",
      name: "Dr. Lucas Hall",
      specialty: "General Physician",
      experience: "11 years",
      rating: "4.6",
      description:
        "Primary care for fever, infection, and routine annual health checks.",
      tags: ["General", "Quick Consult", "Available"],
      availableToday: true,
    },
  ], []);

  const searchRecommendations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return doctors
      .filter((doctor) => {
        const searchable = [
          doctor.name,
          doctor.specialty,
          ...doctor.tags,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .slice(0, 6);
  }, [searchQuery, doctors]);

  useEffect(() => {
    const syncAuthState = () => setIsLoggedIn(isMockAuthenticated());
    syncAuthState()
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("mock-auth-changed", syncAuthState as EventListener);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("mock-auth-changed", syncAuthState as EventListener);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white ">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-6">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle sidebar"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" fill="currentColor" />
            </svg>
          </button>
          <Image
            src={logo}
            alt="Logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <p className="text-lg font-semibold tracking-tight text-black">
            DoctorTube
          </p>
        </div>

        {/* Search Section */}
        {isLoggedIn && (
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="relative w-full max-w-2xl">
              <SearchBar
                   plaHor="Search doctors, clinics, specialty"
                   inputClass="w-full bg-transparent px-5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                   btnClass="border-l border-slate-300 px-5 text-sm text-slate-700 hover:bg-slate-100 transition"
                   inputProps={{
                   onFocus: () => setShowSuggestions(true),
                   onBlur: () =>
                   setTimeout(() => setShowSuggestions(false), 150),

                  onChange: (event) => {
                  setSearchQuery(event.target.value);
                  setShowSuggestions(true);
      },
    }}
  />

              {/* Suggestions Dropdown */}
              {showSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  {searchRecommendations.length > 0 ? (
                    <div className="space-y-1">
                      {searchRecommendations.map((doctor) => (
                        <button
                          key={doctor.id}
                          type="button"
                          onMouseDown={() => {
                            setSearchQuery(doctor.name);
                            setShowSuggestions(false);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100 transition"
                        >
                          <p className="text-sm font-medium text-slate-800">
                            {doctor.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {doctor.specialty}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      No recommendations found
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Avatar */}
        {isLoggedIn && (
          <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-500 font-semibold text-white">
            A
          </div>
        )}
      </div>
    </nav>
  );
}
