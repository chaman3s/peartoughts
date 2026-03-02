import DoctorSideBar from "@/Screen/doctor/layouts/DoctorSideBar";
import NavBar from "@/Components/Nav";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <section className="mx-auto flex w-full max-w-[1600px]">
        <DoctorSideBar />
        <div className="min-w-0 flex-1 bg-gray-100 min-h-screen">{children}</div>
      </section>
    </>
  );
}
