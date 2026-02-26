"use client";
import { Geist, Geist_Mono } from "next/font/google";
import LoginNavBar from "@/Components/Nav/authNavbar";
import { SidebarProvider } from "@/ContextApi/sidebar-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
           <SidebarProvider>
           <LoginNavBar/>
          <main>{children}</main>
        </SidebarProvider>
      </body>
    </html>
  );
}
