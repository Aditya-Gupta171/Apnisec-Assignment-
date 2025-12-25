import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ApniSec | Cloud & VAPT Security Platform",
  description:
    "ApniSec is a modern cybersecurity platform for cloud security, red teaming, and VAPT assessments.",
  keywords: [
    "ApniSec",
    "cybersecurity",
    "cloud security",
    "VAPT",
    "red team",
    "application security",
  ],
  openGraph: {
    title: "ApniSec | Cloud & VAPT Security Platform",
    description:
      "Track cloud security, red team assessments, and VAPT issues in one secure dashboard.",
    url: "https://apnisec.com/",
    siteName: "ApniSec",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
