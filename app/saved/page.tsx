import type { Metadata } from "next";
import SecondaryPageShell from "@/components/SecondaryPageShell";
import SavedContent from "@/components/SavedContent";

export const metadata: Metadata = {
  title: "Saved",
  description: "Saved Mangystau places, hotels and compact route plans.",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <SecondaryPageShell
      activeTab="saved"
      eyebrow="Personal library"
      title="Saved"
      description="Places, hotels and routes kept in a compact travel shelf."
    >
      <SavedContent />
    </SecondaryPageShell>
  );
}
