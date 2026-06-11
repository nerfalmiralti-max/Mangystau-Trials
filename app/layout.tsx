import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "MangystauTrails — travel-tech for Kazakhstan",
  description:
    "MangystauTrails combines digital routes, minimalist design and an interactive travel assistant for journeys across Kazakhstan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#070707] text-white">
        {children}
      </body>
    </html>
  );
}
