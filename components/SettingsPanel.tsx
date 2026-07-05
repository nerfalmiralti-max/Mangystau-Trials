"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { useSettings } from "@/hooks/useSettings";
import { useUserLocation, type LocationPermissionStatus } from "@/hooks/useUserLocation";
import {
  type AppLanguage,
  type Appearance,
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

const appearances: Appearance[] = ["Light", "Dark", "System"];
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

  const setNotification = (key: keyof AppSettings["notifications"], value: boolean) => {
    updateDraft({
      ...draftSettings,
      notifications: {
        ...draftSettings.notifications,
        [key]: value,
      },
    });
  };

  const saveDraft = async () => {
    setIsSaving(true);
    setStatus(t("settings.saving"));

    await new Promise((resolve) => window.setTimeout(resolve, 180));
    saveSettings(draftSettings);
    setStatus(t("settings.saved"));
    setIsSaving(false);
  };

  return (
    <div className="relative z-20 mx-auto w-full max-w-3xl">
      <div className="max-h-[calc(100svh-96px)] overflow-y-auto rounded-t-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:max-h-none md:overflow-visible md:rounded-[24px] md:p-5">
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20 md:hidden" />
        <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">{t("settings.current")}</p>
            <h2 className="mt-2 text-lg font-semibold text-white md:text-xl">
              {languageLabel} / {getAppearanceLabel(draftSettings.appearance, t)}
            </h2>
          </div>
          {status ? (
            <span aria-live="polite" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/62">
              {status}
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 pt-4">
          <SettingGroup title={t("settings.language")} badge={`${t("settings.autoBadge")}: ${languages.find((item) => item.id === detectedLanguage)?.label}`}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
          </SettingGroup>

          <SettingGroup title={t("settings.appearance")}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {appearances.map((appearance) => (
                <ChoiceButton
                  key={appearance}
                  label={getAppearanceLabel(appearance, t)}
                  isActive={appearance === draftSettings.appearance}
                  onClick={() => updateDraft({ ...draftSettings, appearance })}
                />
              ))}
            </div>
          </SettingGroup>

          <SettingGroup title={t("settings.mapStyle")}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {mapStyles.map((mapStyle) => (
                <ChoiceButton
                  key={mapStyle}
                  label={getMapStyleLabel(mapStyle, t)}
                  isActive={mapStyle === draftSettings.mapStyle}
                  onClick={() => updateDraft({ ...draftSettings, mapStyle })}
                />
              ))}
            </div>
            {draftSettings.mapStyle === "Satellite" ? (
              <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/62">
                {t("settings.satellitePreview")}
              </p>
            ) : null}
          </SettingGroup>

          <SettingGroup title={t("settings.locationPermission")}>
            <p className="mb-3 text-sm leading-6 text-white/58">{t("settings.locationHelp")}</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
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
              <button
                type="button"
                onClick={userLocation.coordinates ? userLocation.requestBrowserLocation : userLocation.openLocationModal}
                disabled={userLocation.isLocating || draftSettings.locationStatus === "Not supported"}
                className="btn chat-button inline-flex min-h-11 w-full items-center justify-center disabled:opacity-60 sm:w-auto"
              >
                {userLocation.isLocating ? t("settings.updating") : userLocation.coordinates ? t("settings.update") : t("settings.enable")}
              </button>
            </div>

            {userLocation.locationMessage ? (
              <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/62">
                {userLocation.locationMessage}
              </p>
            ) : null}
          </SettingGroup>

          <SettingGroup title={t("settings.notifications")}>
            <div className="grid gap-2">
              <ToggleRow
                label={t("settings.routeUpdates")}
                checked={draftSettings.notifications.routeUpdates}
                onChange={(value) => setNotification("routeUpdates", value)}
              />
              <ToggleRow
                label={t("settings.weatherAlerts")}
                checked={draftSettings.notifications.weatherAlerts}
                onChange={(value) => setNotification("weatherAlerts", value)}
              />
              <ToggleRow
                label={t("settings.newDestinations")}
                checked={draftSettings.notifications.newDestinations}
                onChange={(value) => setNotification("newDestinations", value)}
              />
            </div>
          </SettingGroup>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!hasChanges || isSaving}
            className="btn chat-button inline-flex min-h-12 w-full items-center justify-center disabled:opacity-50"
          >
            {isSaving ? t("settings.saving") : t("settings.save")}
          </button>
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

function getAppearanceLabel(appearance: Appearance, t: ReturnType<typeof useSettings>["t"]) {
  if (appearance === "Light") return t("settings.light");
  if (appearance === "Dark") return t("settings.dark");
  return t("settings.system");
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
