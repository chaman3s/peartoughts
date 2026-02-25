import DoctorDashboardProvider from "@/ContextApi/doctor-dashboard-provider";
import SideBar from "../../../Components/sideBar";
import { SidebarProvider } from "@/ContextApi/sidebar-context";
import NavBar from "@/Components/Nav";
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <SidebarProvider>
    <NavBar/>
  <DoctorDashboardProvider>
    <section className="mx-auto flex w-full max-w-[1600px]">
     <SideBar/>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
    </DoctorDashboardProvider>
    </SidebarProvider>
  );
}
