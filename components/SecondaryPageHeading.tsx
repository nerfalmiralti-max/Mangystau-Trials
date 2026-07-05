"use client";

import AnimatedTitle from "@/components/AnimatedTitle";
import { useSettings } from "@/hooks/useSettings";
import type { TabKey } from "@/components/TopNavigation";

type SecondaryPageHeadingProps = {
  activeTab: TabKey;
  eyebrow: string;
  title: string;
  description: string;
};

export default function SecondaryPageHeading({
  activeTab,
  eyebrow,
  title,
  description,
}: SecondaryPageHeadingProps) {
  const { t } = useSettings();
  const translatedTitle = activeTab === "settings" ? t("nav.settings") : activeTab === "help" ? t("nav.help") : title;
  const translatedEyebrow =
    activeTab === "settings" ? t("nav.preferences") : activeTab === "help" ? t("nav.support") : eyebrow;

  return (
    <div className="space-y-2">
      <p className="text-sm uppercase tracking-[0.24em] text-white/40">{translatedEyebrow}</p>
      <AnimatedTitle text={translatedTitle} className="text-3xl md:text-4xl" />
      <p className="max-w-3xl text-sm leading-7 text-white/68 md:text-base md:leading-8">
        {description}
      </p>
    </div>
  );
}
