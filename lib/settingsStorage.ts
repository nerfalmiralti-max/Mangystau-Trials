import { APP_SETTINGS_KEY } from "@/lib/appStorage";

export type AppLanguage = "kk" | "ru" | "en";
export type LanguageMode = "auto" | "manual";
export type MapStyle = "Standard" | "Satellite";
export type LocationStatus = "Enabled" | "Disabled" | "Denied" | "Not supported";

export type AppSettings = {
  languageMode: LanguageMode;
  language: AppLanguage;
  mapStyle: MapStyle;
  locationStatus: LocationStatus;
};

export const defaultSettings: AppSettings = {
  languageMode: "auto",
  language: "en",
  mapStyle: "Standard",
  locationStatus: "Disabled",
};

export const settingsChangedEvent = "mangystau:settings-changed";

export function readStoredSettings() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const rawValue = window.localStorage.getItem(APP_SETTINGS_KEY);
    if (!rawValue) {
      return defaultSettings;
    }

    return normalizeSettings(JSON.parse(rawValue));
  } catch {
    return defaultSettings;
  }
}

export function writeStoredSettings(settings: AppSettings) {
  const normalized = normalizeSettings(settings);
  try {
    window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(normalized));
  } catch {
    // Keep the in-memory setting usable when browser storage is restricted.
  }
  window.dispatchEvent(new CustomEvent(settingsChangedEvent, { detail: normalized }));
  return normalized;
}

export function normalizeSettings(value: unknown): AppSettings {
  const candidate = value && typeof value === "object" ? (value as Partial<AppSettings>) : {};

  return {
    languageMode: candidate.languageMode === "manual" ? "manual" : "auto",
    language: isLanguage(candidate.language) ? candidate.language : defaultSettings.language,
    mapStyle: candidate.mapStyle === "Satellite" ? "Satellite" : "Standard",
    locationStatus: isLocationStatus(candidate.locationStatus)
      ? candidate.locationStatus
      : defaultSettings.locationStatus,
  };
}

export function detectLanguage(): AppLanguage {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const locale = navigator.languages?.[0] ?? navigator.language ?? "";
  const region = locale.match(/[-_]([a-z]{2})\b/i)?.[1]?.toUpperCase();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const kazakhstanZones = new Set([
    "Asia/Almaty",
    "Asia/Aqtau",
    "Asia/Atyrau",
    "Asia/Oral",
    "Asia/Qostanay",
    "Asia/Qyzylorda",
  ]);
  const cisRegions = new Set(["AM", "AZ", "BY", "KG", "MD", "RU", "TJ", "TM", "UA", "UZ"]);

  if (region === "KZ" || kazakhstanZones.has(timeZone)) {
    return "kk";
  }

  if (region && cisRegions.has(region)) {
    return "ru";
  }

  return "en";
}

export function resolveLanguage(settings: AppSettings, detectedLanguage: AppLanguage) {
  return settings.languageMode === "auto" ? detectedLanguage : settings.language;
}

function isLanguage(value: unknown): value is AppLanguage {
  return value === "kk" || value === "ru" || value === "en";
}

function isLocationStatus(value: unknown): value is LocationStatus {
  return value === "Enabled" || value === "Disabled" || value === "Denied" || value === "Not supported";
}
