import type { Metadata, Viewport } from "next";
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
  title: "Aura of Intelligence — A Bridge to The Infinite",
  description: "A smartphone-first Aura of Intelligence web interface for collecting structured data about yourself, revisiting it across time, and deliberately declaring selected information to others.",
  applicationName: "Aura of Intelligence",
  openGraph: {
    type: "website",
    siteName: "Aura of Intelligence",
    title: "Aura of Intelligence — A Bridge to The Infinite",
    description: "Collect structured data about yourself, revisit it across time, and deliberately prepare selected information for others.",
  },
  twitter: {
    card: "summary",
    title: "Aura of Intelligence — A Bridge to The Infinite",
    description: "Collect structured data about yourself, revisit it across time, and deliberately prepare selected information for others.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080b12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
