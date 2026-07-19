"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedTitle from "./AnimatedTitle";
import DigitalMountainsBackground from "./DigitalMountainsBackground";
import TopNavigation, { type TabKey } from "./TopNavigation";

type AnimatedHeroProps = {
  activeTab: TabKey;
};

type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primary: string;
  primaryHref: string;
  secondary: string;
  secondaryHref: string;
};

const heroContent: Record<TabKey, HeroContent> = {
  home: {
    eyebrow: "43.415° N / 54.071° E",
    title: "Mangystau begins where familiar routes end.",
    description:
      "Build a road-tested journey through chalk canyons, sacred places and the Caspian coast — with the timing, transport and safety context remote travel needs.",
    primary: "Create my route",
    primaryHref: "/routes",
    secondary: "Explore places",
    secondaryHref: "/explore",
  },
  routes: {
    eyebrow: "Route studio",
    title: "A realistic Mangystau plan in minutes.",
    description:
      "Choose your pace, road setup and main landscape. The planner turns them into a day-by-day route with honest travel notes.",
    primary: "Build a route",
    primaryHref: "/routes",
    secondary: "Open map",
    secondaryHref: "/explore",
  },
  explore: {
    eyebrow: "Live atlas",
    title: "Read the landscape before the road.",
    description:
      "Compare Mangystau's key stops on one map, follow a practical route and open the field guide for each place.",
    primary: "Explore the map",
    primaryHref: "/explore",
    secondary: "Plan a route",
    secondaryHref: "/routes",
  },
  locations: {
    eyebrow: "Field guide",
    title: "Know the place before you arrive.",
    description:
      "Road access, visit time, conditions and responsible travel guidance for Mangystau's defining landscapes.",
    primary: "Browse locations",
    primaryHref: "/locations",
    secondary: "Open map",
    secondaryHref: "/explore",
  },
  chat: {
    eyebrow: "Travel guide",
    title: "Ask the questions that change a trip.",
    description:
      "Get focused help with seasons, drivers, road conditions, packing and the right pace for your group.",
    primary: "Ask the guide",
    primaryHref: "/chat",
    secondary: "Plan a route",
    secondaryHref: "/routes",
  },
  settings: {
    eyebrow: "Preferences",
    title: "Set up the way you travel.",
    description: "Keep language, map style and location access together in one calm control panel.",
    primary: "Open guide",
    primaryHref: "/chat",
    secondary: "Saved trips",
    secondaryHref: "/saved",
  },
  saved: {
    eyebrow: "Your collection",
    title: "Pick up the journey where you left it.",
    description: "Saved places, stays and generated routes remain on this device for quick access.",
    primary: "Create a route",
    primaryHref: "/routes",
    secondary: "Explore places",
    secondaryHref: "/explore",
  },
  offline: {
    eyebrow: "Low-signal travel",
    title: "Prepare the essentials before you leave Aktau.",
    description: "Keep the most useful route notes close when the road moves beyond reliable coverage.",
    primary: "Prepare a guide",
    primaryHref: "/offline",
    secondary: "Saved trips",
    secondaryHref: "/saved",
  },
  profile: {
    eyebrow: "Traveler account",
    title: "Keep your Mangystau plans together.",
    description: "Sign in to manage your profile and keep the planning flow personal across visits.",
    primary: "Create account",
    primaryHref: "/profile?mode=register",
    secondary: "Sign in",
    secondaryHref: "/profile?mode=login",
  },
  help: {
    eyebrow: "Support",
    title: "Get help without losing the route.",
    description: "Find quick answers, share feedback or report a problem from one compact screen.",
    primary: "Open guide",
    primaryHref: "/chat",
    secondary: "Settings",
    secondaryHref: "/settings",
  },
  about: {
    eyebrow: "Built by 2Starks",
    title: "A calmer way into wild Mangystau.",
    description: "A focused travel product for planning remote routes with context, restraint and respect for place.",
    primary: "Explore Mangystau",
    primaryHref: "/explore",
    secondary: "Build a route",
    secondaryHref: "/routes",
  },
};

export default function AnimatedHero({ activeTab }: AnimatedHeroProps) {
  const content = heroContent[activeTab];
  const isHome = activeTab === "home";

  return (
    <section
      className={`relative isolate overflow-hidden ${
        isHome ? "min-h-[92svh] pb-14 md:min-h-screen md:pb-20" : "min-h-[52svh] pb-12 md:min-h-[560px] md:pb-16"
      }`}
    >
      <TopNavigation activeTab={activeTab} />

      {isHome ? (
        <>
          <Image
            src="/locations/photos/bozzhyra.jpg"
            alt="Sunset over the white chalk cliffs of Bozzhyra in Mangystau"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_center]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,7,7,0.94)_0%,rgba(4,7,7,0.7)_43%,rgba(4,7,7,0.14)_78%),linear-gradient(180deg,rgba(4,7,7,0.12)_0%,rgba(4,7,7,0.25)_55%,#070707_100%)]" />
        </>
      ) : (
        <>
          <DigitalMountainsBackground />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(180,147,98,0.12),transparent_28%),linear-gradient(180deg,rgba(7,7,7,0.2),rgba(7,7,7,0.92))]" />
        </>
      )}

      <div
        className={`relative z-10 mx-auto flex max-w-7xl flex-col px-4 sm:px-6 md:px-8 ${
          isHome ? "min-h-[92svh] justify-end pb-12 pt-28 md:min-h-screen md:pb-20" : "justify-end pb-3 pt-32 md:min-h-[560px] md:pb-8"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className={`space-y-5 ${isHome ? "max-w-4xl md:space-y-7" : "max-w-3xl"}`}
        >
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d8c29f]">
            <span className="h-px w-9 bg-[#d8c29f]/70" aria-hidden="true" />
            {content.eyebrow}
          </p>
          <AnimatedTitle
            as="h1"
            text={content.title}
            className={
              isHome
                ? "max-w-4xl text-[clamp(2.65rem,11vw,5rem)] leading-[0.94] tracking-[-0.045em] md:text-[clamp(4rem,7vw,6.8rem)]"
                : "max-w-3xl text-[clamp(2.4rem,9vw,4rem)] leading-[0.98] tracking-[-0.04em] md:text-[clamp(3.2rem,5.6vw,5.25rem)]"
            }
          />
          <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg md:text-xl md:leading-8">
            {content.description}
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <Link href={content.primaryHref} className="btn primary-action w-full justify-center sm:w-auto">
              {content.primary}
              <span aria-hidden="true">→</span>
            </Link>
            <Link href={content.secondaryHref} className="btn glass-card w-full justify-center sm:w-auto">
              {content.secondary}
            </Link>
          </div>
        </motion.div>

        {isHome ? (
          <div className="mt-10 grid max-w-2xl grid-cols-3 divide-x divide-white/14 border-y border-white/14 py-4 text-xs text-white/56 sm:text-sm">
            <HeroFact value="5–7 days" label="ideal first trip" />
            <HeroFact value="4×4" label="remote roads" />
            <HeroFact value="Apr–Jun" label="prime season" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HeroFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 first:pl-0 sm:px-5">
      <strong className="block font-semibold text-white/92">{value}</strong>
      <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-white/42 sm:text-xs">{label}</span>
    </div>
  );
}
