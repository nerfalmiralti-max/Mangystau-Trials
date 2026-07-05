"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { useSettings } from "@/hooks/useSettings";
import { useUserLocation, type LocationPermissionStatus } from "@/hooks/useUserLocation";
import {
  type AppLanguage,
  type AppSettings,
  type LanguageMode,
  type LocationStatus,
  type MapStyle,
  resolveLanguage,
} from "@/lib/settingsStorage";

const languages: { id: AppLanguage; label: string }[] = [
  { id: "kk", label: "Kazakh" },
  { id: "ru", label: "Russian" },
  { id: "en", label: "English" },
];

const mapStyles: MapStyle[] = ["Standard", "Satellite"];

export default function SettingsPanel() {
  const { settings, detectedLanguage, saveSettings, t } = useSettings();
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const userLocation = useUserLocation();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => setDraftSettings(settings));

    return () => window.cancelAnimationFrame(frameId);
  }, [settings]);

  useEffect(() => {
    const nextLocationStatus = toLocationStatus(userLocation.permissionStatus);

    if (nextLocationStatus === "Disabled" && settings.locationStatus !== "Disabled") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setDraftSettings((current) =>
        current.locationStatus === nextLocationStatus
          ? current
          : {
              ...current,
              locationStatus: nextLocationStatus,
            }
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [settings.locationStatus, userLocation.permissionStatus]);

  const hasChanges = useMemo(
    () => JSON.stringify(draftSettings) !== JSON.stringify(settings),
    [draftSettings, settings]
  );
  const languageLabel = useMemo(
    () =>
      languages.find((item) => item.id === resolveLanguage(draftSettings, detectedLanguage))?.label ??
      "English",
    [detectedLanguage, draftSettings]
  );
  const locationStatusLabel = getLocationStatusLabel(draftSettings.locationStatus, t);

  const updateDraft = (nextSettings: AppSettings) => {
    setDraftSettings(nextSettings);
    setStatus(t("settings.unsaved"));
  };

  const setLanguageMode = (mode: LanguageMode) => {
    updateDraft({
      ...draftSettings,
      languageMode: mode,
      language: mode === "auto" ? detectedLanguage : draftSettings.language,
    });
  };

  const setLanguage = (language: AppLanguage) => {
    updateDraft({
      ...draftSettings,
      languageMode: "manual",
      language,
    });
  };

  const saveDraft = async () => {
    setIsSaving(true);
    setStatus(t("settings.saving"));

    await new Promise((resolve) => window.setTimeout(resolve, 160));
    saveSettings(draftSettings);
    setStatus(t("settings.saved"));
    setIsSaving(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-card space-y-4 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">{t("settings.language")}</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{languageLabel}</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58">
            {t("settings.autoBadge")}: {languages.find((item) => item.id === detectedLanguage)?.label}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <ChoiceButton label={t("settings.auto")} isActive={draftSettings.languageMode === "auto"} onClick={() => setLanguageMode("auto")} />
          {languages.map((language) => (
            <ChoiceButton
              key={language.id}
              label={language.label}
              isActive={draftSettings.languageMode === "manual" && draftSettings.language === language.id}
              onClick={() => setLanguage(language.id)}
            />
          ))}
        </div>

        <SettingGroup title={t("settings.mapStyle")}>
          <SegmentedChoices
            items={mapStyles}
            activeItem={draftSettings.mapStyle}
            getLabel={(mapStyle) => getMapStyleLabel(mapStyle, t)}
            onChange={(mapStyle) => updateDraft({ ...draftSettings, mapStyle })}
          />
        </SettingGroup>

        <div className="flex items-center justify-between gap-3 pt-1">
          {status ? <p className="text-sm text-white/58">{status}</p> : <span />}
          <button
            type="button"
            onClick={saveDraft}
            disabled={!hasChanges || isSaving}
            className="btn chat-button min-w-24 justify-center disabled:opacity-50"
          >
            {isSaving ? t("settings.saving") : "Save"}
          </button>
        </div>
      </section>

      <section className="glass-card space-y-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">{t("settings.locationPermission")}</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{locationStatusLabel}</h2>
          </div>
          <button
            type="button"
            onClick={userLocation.coordinates ? userLocation.requestBrowserLocation : userLocation.openLocationModal}
            disabled={userLocation.isLocating || draftSettings.locationStatus === "Not supported"}
            className="btn chat-button justify-center disabled:opacity-60"
          >
            {userLocation.isLocating ? t("settings.updating") : userLocation.coordinates ? t("settings.update") : t("settings.enable")}
          </button>
        </div>

        <p className="text-sm leading-6 text-white/58">{t("settings.locationHelp")}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          <InfoTile label={t("settings.status")} value={locationStatusLabel} />
          <InfoTile
            label={t("settings.coordinates")}
            value={
              userLocation.coordinates
                ? `${userLocation.coordinates[0].toFixed(3)}, ${userLocation.coordinates[1].toFixed(3)}`
                : t("settings.notShared")
            }
          />
        </div>

        {userLocation.locationMessage ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/62">
            {userLocation.locationMessage}
          </p>
        ) : null}
      </section>

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
  getLabel,
  onChange,
}: {
  items: T[];
  activeItem: T;
  getLabel: (item: T) => string;
  onChange: (item: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <ChoiceButton key={item} label={getLabel(item)} isActive={item === activeItem} onClick={() => onChange(item)} />
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

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-white">{value}</p>
    </div>
  );
}

function getMapStyleLabel(mapStyle: MapStyle, t: ReturnType<typeof useSettings>["t"]) {
  return mapStyle === "Satellite" ? t("settings.satellite") : t("settings.standard");
}

function getLocationStatusLabel(status: LocationStatus, t: ReturnType<typeof useSettings>["t"]) {
  if (status === "Enabled") return t("settings.enabled");
  if (status === "Denied") return t("settings.denied");
  if (status === "Not supported") return t("settings.notSupported");
  return t("settings.disabled");
}

function toLocationStatus(status: LocationPermissionStatus): LocationStatus {
  if (status === "granted") return "Enabled";
  if (status === "denied") return "Denied";
  if (status === "unsupported") return "Not supported";
  return "Disabled";
}
