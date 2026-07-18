import type { Metadata } from "next";
import SecondaryPageShell from "@/components/SecondaryPageShell";
import OfflineContent from "@/components/OfflineContent";

export const metadata: Metadata = {
  title: "Offline",
  description: "Saved Mangystau travel packs and route notes for low-signal preparation.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <SecondaryPageShell
      activeTab="offline"
      eyebrow="Low-signal mode"
      title="Offline"
      description="Route notes and travel packs prepared before remote travel; live map tiles still need connectivity."
    >
      <OfflineContent />
    </SecondaryPageShell>
  );
}
