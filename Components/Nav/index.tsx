"use client";
import { setDoctorContextAndNavigate, useNavigate } from "@/utils";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import logo from "@/assets/img/logo.jpg";
import SearchBar from "../SearchBar";
import { useSidebar } from "../../ContextApi/sidebar-context";
import Link from "next/link";
import Button from "../ui/Button";
import { isMockAuthenticated, logoutMockApi } from "@/services/mockAuthApi";
import { usePathname, useRouter } from "next/navigation";
import { useDoctorOptional } from "@/ContextApi/DoctorProfileContext";
import { useDoctor } from "@/ContextApi/doctorContext";
import { useDoctors } from "@/hooks/useDoctors";

type DoctorCard = {
  id: string;
  doctorImage:string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  description: string;
  tags: string[];
  availableToday: boolean;
  doctorEmail?: string;
};



function isDoctorAvailableStatus(status: string | undefined) {
  const normalized = (status ?? "").trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === "not available") return false;
  return normalized === "available" || normalized === "avaalble" || normalized === "online";
}

function subscribeAuthChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("mock-auth-changed", handler as EventListener);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("mock-auth-changed", handler as EventListener);
  };
}

function getUserProfileInitialSnapshot() {
  if (typeof window === "undefined") return "U";

  try {
    const sessionRaw = window.localStorage.getItem("mock_auth_session");
    const usersRaw = window.localStorage.getItem("mock_auth_users");
    if (!sessionRaw || !usersRaw) return "U";

    const session = JSON.parse(sessionRaw) as { userId?: string | null };
    const users = JSON.parse(usersRaw) as Array<{ id?: string; fullname?: string; email?: string }>;
    if (!session?.userId || !Array.isArray(users)) return "U";

    const matchedUser = users.find((item) => item?.id === session.userId);
    const fullName = typeof matchedUser?.fullname === "string" ? matchedUser.fullname.trim() : "";
    const email = typeof matchedUser?.email === "string" ? matchedUser.email.trim() : "";
    const source = fullName || email;
    const firstChar = source.charAt(0).toUpperCase();
    return firstChar || "U";
  } catch {
    return "U";
  }
}



export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { toggle } = useSidebar();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isDoctorRoute = pathname?.startsWith("/doctor");
  const doctorContext = useDoctorOptional();
  const profileHref = isDoctorRoute ? "/doctor/home/profile" : "/home/Profile";
  const prescriptionHref = "/home/prescription";
  const loginHref = isDoctorRoute ? "/doctor/login" : "/login";
  const isLoggedIn = useSyncExternalStore(
    subscribeAuthChanges,
    () => isMockAuthenticated(),
    () => false
  );
  const navigate = useNavigate();
  const userProfileInitial = useSyncExternalStore(
    subscribeAuthChanges,
    getUserProfileInitialSnapshot,
    () => "U"
  );
  const isDoctorAvailable = (() => {
    if (!doctorContext?.doctor) return false;
    return isDoctorAvailableStatus(doctorContext.doctor.status);
  })();

  const syncDoctorAvailabilityInStorage = (nextStatus: string) => {
    if (typeof window === "undefined" || !doctorContext?.doctor) return;

    const normalize = (value: string | undefined) => (value ?? "").trim().toLowerCase();
    const storageKey = "doctor_data";
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const doctorName = normalize(doctorContext.doctor.doctorName);
      const specialist = normalize(doctorContext.doctor.specialist);
      const email = normalize(doctorContext.doctor.doctorEmail);
      const nextAvailableToday = isDoctorAvailableStatus(nextStatus);

      const updated = parsed.map((item: any) => {
        const itemName = normalize(item?.name);
        const itemSpecialty = normalize(item?.specialty);
        const itemEmail = normalize(item?.doctorEmail);
        const matchesByEmail = email && itemEmail === email;
        const matchesByProfile = itemName === doctorName && itemSpecialty === specialist;

        if (!matchesByEmail && !matchesByProfile) return item;

        return {
          ...item,
          availableToday: nextAvailableToday,
        };
      });

      window.localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      return;
    }
  };

  const handleDoctorStatusToggle = () => {
    if (!doctorContext) return;
    const nextStatus = isDoctorAvailable ? "offline" : "online";
    doctorContext.updateDoctor({ status: nextStatus });
    syncDoctorAvailabilityInStorage(nextStatus);
  };
  const { setDoctor } = useDoctor();
  const doctors = useDoctors()
  
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
    if (!isProfileMenuOpen) return;

    const closeProfileMenu = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, [isProfileMenuOpen]);

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
            DoctorCare
          </p>
        </div>

        {/* Search Section */}
        {isLoggedIn && !isDoctorRoute && (
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
                    <div className="space-y-1 " >
                    {searchRecommendations.map((doctor, index) => (
                        <button
                          key={`${doctor.id}-${index}`}
                          type="button"
                          onMouseDown={() => {
                            setSearchQuery(doctor.name);
                            setShowSuggestions(false);
                            setDoctorContextAndNavigate(doctor, "/home/dashBoard/DoctorDetail", setDoctor, navigate)
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
        {isLoggedIn && isDoctorRoute ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDoctorStatusToggle}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isDoctorAvailable
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isDoctorAvailable ? "Available" : "Not Available"}
            </button>
            <button
              type="button"
              onClick={() => {
                logoutMockApi();
                router.push(loginHref);
              }}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Logout
            </button>
          </div>
        ) : isLoggedIn ? (
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="grid h-9 w-9 place-items-center rounded-full bg-cyan-500 font-semibold text-white"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              aria-label="Profile menu"
            >
              {userProfileInitial}
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <Link
                  href={profileHref}
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  View Profile
                </Link>
                {!isDoctorRoute && (
                  <Link
                    href={prescriptionHref}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Prescription
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logoutMockApi();
                    setIsProfileMenuOpen(false);
                    router.push(loginHref);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/" passHref>
            <Button className="text-sm font-medium !py-1.5">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
