import "server-only";

import { cookies, headers } from "next/headers";
import {
  getLanguageFromAcceptLanguage,
  isAppLanguage,
  languageCookieName,
  languageModeCookieName,
} from "@/lib/i18n";
import { defaultSettings, type AppSettings } from "@/lib/settingsStorage";

export async function getInitialAppSettings(): Promise<AppSettings> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const storedLanguage = cookieStore.get(languageCookieName)?.value;
  const language = isAppLanguage(storedLanguage)
    ? storedLanguage
    : getLanguageFromAcceptLanguage(headerStore.get("accept-language"));
  const languageMode =
    cookieStore.get(languageModeCookieName)?.value === "manual" ? "manual" : "auto";

  return {
    ...defaultSettings,
    languageMode,
    language,
  };
}
