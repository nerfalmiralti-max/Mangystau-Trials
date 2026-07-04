import type { Metadata } from "next";
import SecondaryPageShell from "@/components/SecondaryPageShell";
import HelpContent from "@/components/HelpContent";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "MangystauTrails help, FAQ, feedback and problem reporting.",
};

export default function HelpPage() {
  return (
    <SecondaryPageShell
      activeTab="help"
      eyebrow="Support"
      title="Help & FAQ"
      description="Fast answers, feedback and problem reporting in one compact support screen."
    >
      <HelpContent />
    </SecondaryPageShell>
  );
}
