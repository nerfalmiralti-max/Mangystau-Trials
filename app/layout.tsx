import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { SettingsProvider } from "@/hooks/useSettings";
import { ToastProvider } from "@/components/ToastProvider";
import LocaleDocumentMetadata from "@/components/LocaleDocumentMetadata";
import { getLanguageLocale, translateUiText } from "@/lib/i18n";
import { getInitialAppSettings } from "@/lib/requestLanguage";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const initialSettings = await getInitialAppSettings();
  const language = initialSettings.language;
  const title = translateUiText(language, "Mangystau Trails");
  const description = translateUiText(
    language,
    "Mangystau route planning, destination guides and practical travel tools for Kazakhstan."
  );

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: getLanguageLocale(language).replace("-", "_"),
      type: "website",
      images: ["/locations/photos/bozzhyra.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/locations/photos/bozzhyra.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSettings = await getInitialAppSettings();
  const language = initialSettings.language;

  return (
    <html lang={language} className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#070707] text-white">
        <a href="#main-content" className="skip-link">
          {translateUiText(language, "Skip to content")}
        </a>
        <SettingsProvider initialLanguage={language} initialSettings={initialSettings}>
          <Suspense fallback={null}>
            <LocaleDocumentMetadata />
          </Suspense>
          <ToastProvider>
            <div id="page-content" tabIndex={-1}>{children}</div>
          </ToastProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
