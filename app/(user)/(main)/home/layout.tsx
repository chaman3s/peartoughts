import DoctorDashboardProvider from "@/ContextApi/doctor-dashboard-provider";
import UserSideBar from "@/Screen/user/layout/UserSideBar";
import { SidebarProvider } from "@/ContextApi/sidebar-context";
import NavBar from "@/Components/Nav";
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <SidebarProvider>
   
  <DoctorDashboardProvider>
     <NavBar/>
    <section className="mx-auto flex w-full max-w-[1600px] scrollbar-hide">
     <UserSideBar/>
      <div className="min-w-0 flex-1 scrollbar-hide">{children}</div>
    </section>
    </DoctorDashboardProvider>
    </SidebarProvider>
  );
}
