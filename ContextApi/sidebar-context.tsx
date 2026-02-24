"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type SidebarContextValue = {
  isCollapsed: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const value = useMemo(
    () => ({
      isCollapsed,
      toggle: () => setIsCollapsed((prev) => !prev),
    }),
    [isCollapsed]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
