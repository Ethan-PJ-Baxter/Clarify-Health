import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { ServiceWorkerRegistration } from "@/components/ui/sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarify - NHS Symptom Tracker",
  description:
    "Track your symptoms, get AI-assisted insights, and generate comprehensive reports for your GP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OfflineIndicator />
        {children}
        <Toaster position="top-right" richColors />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
