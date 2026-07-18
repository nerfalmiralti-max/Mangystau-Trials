import type { Metadata } from "next";
import SecondaryPageShell from "@/components/SecondaryPageShell";
import SettingsPanel from "@/components/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings",
  description: "MangystauTrails settings for language, map style and location.",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <SecondaryPageShell
      activeTab="settings"
      eyebrow="Preferences"
      title="Settings"
      description="Compact controls for travel preferences and location access."
    >
      <SettingsPanel />
    </SecondaryPageShell>
  );
}
