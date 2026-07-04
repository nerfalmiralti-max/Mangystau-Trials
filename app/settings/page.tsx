import type { Metadata } from "next";
import SecondaryPageShell from "@/components/SecondaryPageShell";
import SettingsPanel from "@/components/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings",
  description: "MangystauTrails settings for language, appearance, map style, location and notifications.",
};

export default function SettingsPage() {
  return (
    <SecondaryPageShell
      activeTab="settings"
      eyebrow="Preferences"
      title="Settings"
      description="Compact controls for travel preferences, location access and alerts."
    >
      <SettingsPanel />
    </SecondaryPageShell>
  );
}
