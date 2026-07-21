"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import { getLanguageLocale, type UiTextKey } from "@/lib/i18n";

const routeTitles: Array<[prefix: string, title: UiTextKey]> = [
  ["/explore", "Explore | Mangystau Trails"],
  ["/routes", "Routes | Mangystau Trails"],
  ["/chat", "Guide | Mangystau Trails"],
  ["/locations", "Locations | Mangystau Trails"],
  ["/saved", "Saved | Mangystau Trails"],
  ["/settings", "Settings | Mangystau Trails"],
  ["/help", "Help | Mangystau Trails"],
  ["/about", "About | Mangystau Trails"],
  ["/offline", "Offline | Mangystau Trails"],
];

export default function LocaleDocumentMetadata() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language, tx } = useSettings();

  useEffect(() => {
    const titleKey = getTitleKey(pathname, searchParams.get("mode"));
    const descriptionKey = getDescriptionKey(pathname);
    const title = tx(titleKey);
    const description = tx(descriptionKey);

    document.documentElement.lang = getLanguageLocale(language).split("-")[0];
    document.title = title;
    updateMeta('meta[name="description"]', "content", description);
    updateMeta('meta[property="og:title"]', "content", title);
    updateMeta('meta[property="og:description"]', "content", description);
    updateMeta('meta[name="twitter:title"]', "content", title);
    updateMeta('meta[name="twitter:description"]', "content", description);
  }, [language, pathname, searchParams, tx]);

  return null;
}

function getTitleKey(pathname: string, mode: string | null): UiTextKey {
  if (pathname === "/profile") {
    return mode === "register" ? "Sign up | Mangystau Trails" : "Log in | Mangystau Trails";
  }
  if (pathname === "/") return "Home | Mangystau Trails";
  return routeTitles.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Mangystau Trails";
}

function getDescriptionKey(pathname: string): UiTextKey {
  if (pathname.startsWith("/explore") || pathname.startsWith("/locations")) {
    return "Explore Mangystau destinations, routes and map filters.";
  }
  if (pathname.startsWith("/routes")) {
    return "Build a practical Mangystau route around your time, transport and travel style.";
  }
  if (pathname.startsWith("/chat")) {
    return "Use the Mangystau guide for places, stays and practical trip context.";
  }
  if (pathname.startsWith("/profile")) {
    return "Manage your Mangystau Trails account and saved travel context.";
  }
  return "Mangystau route planning, destination guides and practical travel tools for Kazakhstan.";
}

function updateMeta(selector: string, attribute: string, value: string) {
  document.head.querySelector<HTMLMetaElement>(selector)?.setAttribute(attribute, value);
}
