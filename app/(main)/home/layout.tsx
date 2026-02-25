import DoctorDashboardProvider from "@/ContextApi/doctor-dashboard-provider";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DoctorDashboardProvider>{children}</DoctorDashboardProvider>;
}
