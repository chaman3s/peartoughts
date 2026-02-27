"use client";

import LoginNavBar from "@/Components/Nav/authNavbar";
import { SidebarProvider } from "@/ContextApi/sidebar-context";

export default function DoctorAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <LoginNavBar />
      {children}
    </SidebarProvider>
  );
}
