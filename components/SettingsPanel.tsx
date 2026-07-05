"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { useUserLocation } from "@/hooks/useUserLocation";
import { APP_SETTINGS_KEY } from "@/lib/appStorage";

type Language = "kk" | "ru" | "en";
type LanguageMode = "auto" | "manual";
type Appearance = "Light" | "Dark" | "System";
type MapStyle = "Standard" | "Satellite";

type AppSettings = {
  languageMode: LanguageMode;
  language: Language;
  appearance: Appearance;
  mapStyle: MapStyle;
  notifications: {
    routeUpdates: boolean;
    weatherAlerts: boolean;
    newDestinations: boolean;
  };
};

const defaultSettings: AppSettings = {
  languageMode: "auto",
  language: "en",
  appearance: "System",
  mapStyle: "Standard",
  notifications: {
    routeUpdates: true,
    weatherAlerts: true,
    newDestinations: false,
  },
};

const languages: { id: Language; label: string }[] = [
  { id: "kk", label: "Kazakh" },
  { id: "ru", label: "Russian" },
  { id: "en", label: "English" },
];

const appearances: Appearance[] = ["Light", "Dark", "System"];
const mapStyles: MapStyle[] = ["Standard", "Satellite"];

export default function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [detectedLanguage, setDetectedLanguage] = useState<Language>("en");
  const [status, setStatus] = useState("");
  const userLocation = useUserLocation();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const detected = detectLanguage();
      setDetectedLanguage(detected);

      const stored = readSettings();
      const nextSettings = {
        ...defaultSettings,
        ...stored,
        notifications: {
          ...defaultSettings.notifications,
          ...stored?.notifications,
        },
      };

      if (nextSettings.languageMode === "auto") {
        nextSettings.language = detected;
      }

      setSettings(nextSettings);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const languageLabel = useMemo(
    () => languages.find((item) => item.id === settings.language)?.label ?? "English",
    [settings.language]
  );

  const saveSettings = (nextSettings: AppSettings) => {
    setSettings(nextSettings);
    window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(nextSettings));
    setStatus("Settings saved");
  };

  const setLanguageMode = (mode: LanguageMode) => {
    saveSettings({
      ...settings,
      languageMode: mode,
      language: mode === "auto" ? detectedLanguage : settings.language,
    });
  };

  const setLanguage = (language: Language) => {
    saveSettings({
      ...settings,
      languageMode: "manual",
      language,
    });
  };

  const setNotification = (key: keyof AppSettings["notifications"], value: boolean) => {
    saveSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  return (
    <div className="relative z-20 mx-auto w-full max-w-3xl">
      <div className="max-h-[calc(100svh-96px)] overflow-y-auto rounded-t-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:max-h-none md:overflow-visible md:rounded-[24px] md:p-5">
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20 md:hidden" />
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Current settings</p>
            <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">{languageLabel} / {settings.appearance}</h2>
          </div>
          {status ? (
            <span aria-live="polite" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/62">
              {status}
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 pt-4">
          <SettingGroup title="Language" badge={`Auto: ${languages.find((item) => item.id === detectedLanguage)?.label}`}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ChoiceButton label="Auto" isActive={settings.languageMode === "auto"} onClick={() => setLanguageMode("auto")} />
              {languages.map((language) => (
                <ChoiceButton
                  key={language.id}
                  label={language.label}
                  isActive={settings.languageMode === "manual" && settings.language === language.id}
                  onClick={() => setLanguage(language.id)}
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup title="Appearance">
            <SegmentedChoices
              items={appearances}
              activeItem={settings.appearance}
              onChange={(appearance) => saveSettings({ ...settings, appearance })}
            />
          </SettingGroup>

          <SettingGroup title="Map Style">
            <SegmentedChoices
              items={mapStyles}
              activeItem={settings.mapStyle}
              onChange={(mapStyle) => saveSettings({ ...settings, mapStyle })}
            />
          </SettingGroup>

          <SettingGroup title="Location Permission">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="grid gap-2 sm:grid-cols-2">
                <InfoTile label="Status" value={userLocation.permissionStatus} />
                <InfoTile
                  label="Coordinates"
                  value={
                    userLocation.coordinates
                      ? `${userLocation.coordinates[0].toFixed(3)}, ${userLocation.coordinates[1].toFixed(3)}`
                      : "Not shared"
                  }
                />
              </div>
              <button
                type="button"
                onClick={userLocation.coordinates ? userLocation.requestBrowserLocation : userLocation.openLocationModal}
                disabled={userLocation.isLocating}
                className="btn chat-button inline-flex min-h-11 w-full items-center justify-center disabled:opacity-60 sm:w-auto"
              >
                {userLocation.isLocating ? "Updating..." : userLocation.coordinates ? "Update" : "Enable"}
              </button>
            </div>

            {userLocation.locationMessage ? (
              <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/62">
                {userLocation.locationMessage}
              </p>
            ) : null}
          </SettingGroup>

          <SettingGroup title="Notifications">
            <div className="grid gap-2">
              <ToggleRow
                label="Route Updates"
                checked={settings.notifications.routeUpdates}
                onChange={(value) => setNotification("routeUpdates", value)}
              />
              <ToggleRow
                label="Weather Alerts"
                checked={settings.notifications.weatherAlerts}
                onChange={(value) => setNotification("weatherAlerts", value)}
              />
              <ToggleRow
                label="New Destinations"
                checked={settings.notifications.newDestinations}
                onChange={(value) => setNotification("newDestinations", value)}
              />
            </div>
          </SettingGroup>
        </div>
      </div>

      <LocationPermissionModal
        isOpen={userLocation.isPermissionModalOpen}
        isLoading={userLocation.isLocating}
        onAllow={userLocation.requestBrowserLocation}
        onMaybeLater={userLocation.dismissLocationModal}
      />
    </div>
  );
}

function SettingGroup({ title, children, badge }: { title: string; children: ReactNode; badge?: string }) {
  return (
    <section className="rounded-[18px] border border-white/10 bg-white/5 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/38 md:text-xs">{title}</p>
        {badge ? <span className="text-[11px] text-white/42 md:text-xs">{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

function SegmentedChoices<T extends string>({
  items,
  activeItem,
  onChange,
}: {
  items: T[];
  activeItem: T;
  onChange: (item: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <ChoiceButton key={item} label={item} isActive={item === activeItem} onClick={() => onChange(item)} />
      ))}
    </div>
  );
}

function ChoiceButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`btn inline-flex min-h-10 shrink-0 items-center justify-center text-center text-[12px] md:text-[13px] ${
        isActive ? "btn-active ring-1 ring-white/35" : "bg-white/5 text-white/78"
      }`}
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-[13px] font-medium text-white md:text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-white"
      />
    </label>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 md:text-xs">{label}</p>
      <p className="mt-1 text-[13px] font-semibold capitalize text-white md:text-sm">{value}</p>
    </div>
  );
}

function readSettings(): Partial<AppSettings> | null {
  try {
    const rawValue = window.localStorage.getItem(APP_SETTINGS_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<AppSettings>;

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function detectLanguage(): Language {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const locale = navigator.languages?.[0] ?? navigator.language ?? "";
  const region = locale.match(/[-_]([a-z]{2})\b/i)?.[1]?.toUpperCase();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const kazakhstanZones = new Set(["Asia/Almaty", "Asia/Aqtau", "Asia/Atyrau", "Asia/Oral", "Asia/Qostanay", "Asia/Qyzylorda"]);
  const cisRegions = new Set(["AM", "AZ", "BY", "KG", "MD", "RU", "TJ", "TM", "UA", "UZ"]);

  if (region === "KZ" || kazakhstanZones.has(timeZone)) {
    return "kk";
  }

  if (region && cisRegions.has(region)) {
    return "ru";
  }

  return "en";
}
