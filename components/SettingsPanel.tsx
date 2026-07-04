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
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-card space-y-4 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Language</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{languageLabel}</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58">
            Auto: {languages.find((item) => item.id === detectedLanguage)?.label}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
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
      </section>

      <div className="grid gap-4">
        <section className="glass-card space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Location</p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {userLocation.coordinates ? "Enabled" : "Permission"}
              </h2>
            </div>
            <button
              type="button"
              onClick={userLocation.coordinates ? userLocation.requestBrowserLocation : userLocation.openLocationModal}
              disabled={userLocation.isLocating}
              className="btn chat-button justify-center disabled:opacity-60"
            >
              {userLocation.isLocating ? "Updating..." : userLocation.coordinates ? "Update Permission" : "Enable"}
            </button>
          </div>

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

          {userLocation.locationMessage ? (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/62">
              {userLocation.locationMessage}
            </p>
          ) : null}
        </section>

        <section className="glass-card space-y-3 p-4 md:p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">Notifications</p>
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
        </section>
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

function SettingGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 rounded-[18px] border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/38">{title}</p>
      {children}
    </div>
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
      className={`btn shrink-0 justify-center ${isActive ? "btn-active" : "bg-white/5 text-white/78"}`}
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
      <span className="text-sm font-medium text-white">{label}</span>
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
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-white">{value}</p>
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
