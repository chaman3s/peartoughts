"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../ContextApi/sidebar-context";

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
    href: "/dashBoard",
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
    label: "Doctor Detail",
    href: "/dashBoard/DoctorDetail",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M12 2a5 5 0 0 0-5 5v1H6a2 2 0 0 0-2 2v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 6V7a3 3 0 1 1 6 0v1H9Zm3 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "book-appointment",
    label: "Appointments",
    href: "/dashBoard/BookAppointment",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          d="M7 2h2v2h6V2h2v2h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V2Zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9ZM7 7H6a1 1 0 0 0-1 1h14a1 1 0 0 0-1-1h-1v1h-2V7H9v1H7V7Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default function SideBar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={`hidden shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 lg:block ${
        isCollapsed ? "w-24" : "w-72"
      }`}
    >
      <div className={`sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-5 ${isCollapsed ? "px-2" : "px-4"}`}>
        {!isCollapsed && (
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Navigation
          </p>
        )}

        <nav className={`${isCollapsed ? "mt-1" : "mt-3"} space-y-1`}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`group flex rounded-xl py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_10px_24px_-16px_rgba(37,99,235,0.95)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } ${isCollapsed ? "justify-center px-2" : "items-center gap-3 px-3"}`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    isActive ? "bg-white/20" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                  }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Need help?</p>
            <p className="mt-1 text-xs text-slate-600">Chat with support to get faster booking assistance.</p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Contact Support
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
