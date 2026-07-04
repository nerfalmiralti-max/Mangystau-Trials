import type { Metadata } from "next";
import SecondaryPageShell from "@/components/SecondaryPageShell";
import OfflineContent from "@/components/OfflineContent";

export const metadata: Metadata = {
  title: "Offline",
  description: "Downloaded Mangystau routes, guides and maps for low-signal travel.",
};

export default function OfflinePage() {
  return (
    <SecondaryPageShell
      activeTab="offline"
      eyebrow="Low-signal mode"
      title="Offline"
      description="Routes, guides and maps prepared before remote travel."
    >
      <OfflineContent />
    </SecondaryPageShell>
  );
}
