import type { ReactNode } from "react";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import type { TabKey } from "@/components/TopNavigation";

type SecondaryPageShellProps = {
  activeTab: TabKey;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  maxWidth?: "5xl" | "6xl" | "7xl";
};

const maxWidthClass = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export default function SecondaryPageShell({
  activeTab,
  eyebrow,
  title,
  description,
  children,
  maxWidth = "6xl",
}: SecondaryPageShellProps) {
  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab={activeTab} />

      <main className={`relative z-10 mx-auto ${maxWidthClass[maxWidth]} px-4 pb-20 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8`}>
        <section className="space-y-5 md:space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-white/40">{eyebrow}</p>
            <AnimatedTitle text={title} className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/68 md:text-base md:leading-8">
              {description}
            </p>
          </div>

          {children}
        </section>
      </main>
    </div>
  );
}
