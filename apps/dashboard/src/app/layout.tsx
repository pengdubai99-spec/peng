import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PENG | Smart Fleet Management Platform",
  description: "AI-powered real-time fleet tracking and management system for Dubai. 7/24 security, GPS tracking, and camera integration.",
  keywords: ["fleet management", "GPS tracking", "Dubai", "AI", "security", "RTA", "Dubai Taxis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
