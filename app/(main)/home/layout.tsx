import DoctorDashboardProvider from "@/ContextApi/doctor-dashboard-provider";
import SideBar from "@/Components/SideBar";
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (<DoctorDashboardProvider>
    <section className="mx-auto flex w-full max-w-[1600px]">
     <SideBar/>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
    </DoctorDashboardProvider>);
}
