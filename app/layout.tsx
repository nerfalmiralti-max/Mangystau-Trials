import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { SettingsProvider } from "@/hooks/useSettings";
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
    <html lang="ru" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#070707] text-white">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var raw=localStorage.getItem("mangystau:settings");var s=raw?JSON.parse(raw):{};var a=s.appearance||"System";var l=s.languageMode==="manual"&&s.language?s.language:"ru";var light=a==="Light"||(a==="System"&&matchMedia("(prefers-color-scheme: light)").matches);document.documentElement.dataset.appearance=String(a).toLowerCase();document.documentElement.dataset.theme=light?"light":"dark";document.documentElement.style.colorScheme=light?"light":"dark";document.documentElement.lang=l;}catch(e){}`,
          }}
        />
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
