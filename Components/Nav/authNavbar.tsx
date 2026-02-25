"use client";
import Image from "next/image";
import logo from "@/assets/img/logo.jpg";
export default function authNavBar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white ">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-6">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <p className="text-lg font-semibold tracking-tight text-black">
            DoctorTube
          </p>
        </div>
      </div>
    </nav>
  );
}
