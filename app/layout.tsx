import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - travel-tech for Kazakhstan`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - travel-tech for Kazakhstan`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: ["/locations/photos/bozzhyra.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - travel-tech for Kazakhstan`,
    description: DEFAULT_DESCRIPTION,
    images: ["/locations/photos/bozzhyra.jpg"],
  },
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
