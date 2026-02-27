import SideBar from "@/Components/sideBar";
import { ReactNode } from "react";
type SideBarItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
};

const menuItems: SideBarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/home/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 0h11v8H10v-8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
   
  {
    id: "doctor-detail",
    label: "Appointment",
    href: "/home/appointments",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M7 2h2v2h6V2h2v2h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V2Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM7 7H6a1 1 0 0 0-1 1h14a1 1 0 0 0-1-1h-1v1h-2V7H9v1H7V7Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "book-appointment",
    label: "Record",
    href: "/dashBoard/BookAppointment",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 2a5 5 0 0 0-5 5v1H6a2 2 0 0 0-2 2v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 6V7a3 3 0 1 1 6 0v1H9Zm3 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];
export default function DoctorSideBar() {
    return <SideBar menuItems={menuItems} />;
};
