import DoctorDashboardProvider from "@/ContextApi/doctor-dashboard-provider";
import { DoctorProfileProvider } from "@/ContextApi/DoctorProfileContext";
import { SidebarProvider } from "@/ContextApi/sidebar-context";
import DoctorSideBar from "@/Screen/doctor/layouts/DoctorSideBar";
import NavBar from "@/Components/Nav";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <DoctorProfileProvider>
        <DoctorDashboardProvider>
          <section className="mx-auto flex w-full max-w-[1600px]">
            
            <div className="min-w-0 flex-1">{children}</div>
          </section>
        </DoctorDashboardProvider>
      </DoctorProfileProvider>
    </SidebarProvider>
  );
}
