import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegistration } from "@/components/service-worker";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Complete Seerah System — TheMuslimMan",
    template: "%s | TheMuslimMan",
  },
  description:
    "Finally understand the full life of the Prophet ﷺ in one structured, complete system. 100+ parts with video, audio, briefings, guides, and more.",
  keywords: ["Seerah", "Prophet Muhammad", "Islamic learning", "Muslim education", "Seerah course"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://themuslimman.com",
    siteName: "TheMuslimMan",
    title: "Complete Seerah System — TheMuslimMan",
    description:
      "Finally understand the full life of the Prophet ﷺ in one structured, complete system.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete Seerah System — TheMuslimMan",
    description:
      "Finally understand the full life of the Prophet ﷺ in one structured, complete system.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-ink text-text antialiased">
        <ServiceWorkerRegistration />
        {children}
        <Toaster position="bottom-right" richColors theme="dark" />
      </body>
    </html>
  );
}
