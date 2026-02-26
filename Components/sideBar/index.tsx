"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../../ContextApi/sidebar-context";
import type { ReactNode } from "react";

type SideBarItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
};

type SideBarProps = {
  menuItems: SideBarItem[];
  title?: string;
  showSupportCard?: boolean;
};

export default function SideBar({
  menuItems,
  title = "Navigation",
  showSupportCard = true,
}: SideBarProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={`hidden shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 lg:block ${
        isCollapsed ? "w-24" : "w-72"
      }`}
    >
      <div
        className={`sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-5 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        {/* Title */}
        {!isCollapsed && (
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
        )}

        {/* Menu */}
        <nav className={`${isCollapsed ? "mt-1" : "mt-3"} space-y-1`}>
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`group flex rounded-xl py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_10px_24px_-16px_rgba(37,99,235,0.95)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } ${
                  isCollapsed
                    ? "justify-center px-2"
                    : "items-center gap-3 px-3"
                }`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    isActive
                      ? "bg-white/20"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white"
                  }`}
                >
                  {item.icon}
                </span>

                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Optional Support Card */}
        {showSupportCard && !isCollapsed && (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Need help?
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Chat with support to get faster booking assistance.
            </p>
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