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

const heroContent: Record<TabKey, { title: string; description: string; primary: string; primaryHref: string; secondary: string; secondaryHref: string }> = {
  home: {
    title: "MangystauTrails for Kazakhstan journeys",
    description:
      "Start with a calm travel-tech hub for routes, maps and smart planning across Kazakhstan's cities, mountains and desert landscapes.",
    primary: "Start journey",
    primaryHref: "/explore",
    secondary: "Build route",
    secondaryHref: "/routes",
  },
  routes: {
    title: "Design routes that feel worth walking",
    description:
      "Generate scenic paths with meaningful stops, practical pacing and highlighted places between the first point and the final destination.",
    primary: "Generate route",
    primaryHref: "/routes",
    secondary: "Open map",
    secondaryHref: "/explore",
  },
  explore: {
    title: "Explore Kazakhstan on a living map",
    description:
      "Move between cities, canyons, lakes, heritage stops and remote viewpoints while the map keeps every route visually connected.",
    primary: "View places",
    primaryHref: "/explore",
    secondary: "Open guide",
    secondaryHref: "/chat",
  },
  locations: {
    title: "Deep destination guides for every trail",
    description:
      "Read rich guides for Mangystau and iconic Kazakhstan destinations with safety advice, practical travel tips and sustainable route ideas.",
    primary: "Browse locations",
    primaryHref: "/locations",
    secondary: "Open map",
    secondaryHref: "/explore",
  },
  chat: {
    title: "Use a smart travel assistant before you go",
    description:
      "Get quick planning help for seasons, transport, safety, packing and the kind of Kazakhstan route that matches your travel style.",
    primary: "Open assistant",
    primaryHref: "/chat",
    secondary: "Plan route",
    secondaryHref: "/routes",
  },
  settings: {
    title: "Tune the trip layer once",
    description:
      "Keep language, appearance, map style, location access and notifications compactly managed from one calm travel control panel.",
    primary: "Open guide",
    primaryHref: "/chat",
    secondary: "Saved items",
    secondaryHref: "/saved",
  },
  saved: {
    title: "Return to saved travel ideas",
    description:
      "Saved places, hotels and routes stay close, so planning can continue without scanning the whole guide again.",
    primary: "Open guide",
    primaryHref: "/chat",
    secondary: "Offline",
    secondaryHref: "/offline",
  },
  offline: {
    title: "Prepare routes for weak signal",
    description:
      "Downloaded guides, maps and route packs keep the essential Mangystau details available before remote drives.",
    primary: "Download guide",
    primaryHref: "/offline",
    secondary: "Saved items",
    secondaryHref: "/saved",
  },
  profile: {
    title: "Keep your travel profile ready",
    description:
      "Log in or sign up to keep saved routes, visited places and preferences close, so every new plan starts with useful context.",
    primary: "Sign up",
    primaryHref: "/profile?mode=register",
    secondary: "Log in",
    secondaryHref: "/profile?mode=login",
  },
  help: {
    title: "Get help without losing momentum",
    description:
      "Fast answers, feedback and problem reporting sit in a compact support screen for travelers and administrators.",
    primary: "Open guide",
    primaryHref: "/chat",
    secondary: "Settings",
    secondaryHref: "/settings",
  },
  about: {
    title: "MangystauTrails by 2Starks",
    description:
      "A focused travel service for discovering Mangystau with compact planning, practical route context and respectful local guidance.",
    primary: "Explore Mangystau",
    primaryHref: "/chat",
    secondary: "Terms",
    secondaryHref: "/about",
  },
};

export default function AnimatedHero({ activeTab }: AnimatedHeroProps) {
  const content = heroContent[activeTab];

  return (
    <section className="relative isolate min-h-[82svh] overflow-hidden pb-16 md:min-h-screen md:pb-20">
      <TopNavigation activeTab={activeTab} />
      <DigitalMountainsBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),transparent_22%),linear-gradient(180deg,rgba(7,7,7,0.18),rgba(7,7,7,0.85))] pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">MangystauTrails</p>
            <p className="max-w-xl text-sm leading-6 text-white/60">
              Plan Kazakhstan routes with a modern travel-tech interface focused on Mangystau, city stops and wild landscapes.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-10 md:mt-16 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl space-y-6 md:space-y-8"
          >
            <AnimatedTitle
              text={content.title}
              className="text-[clamp(2.15rem,12vw,3.8rem)] leading-[0.98] md:text-[clamp(3.2rem,6vw,5.2rem)] md:leading-[0.95]"
            />
            <p className="max-w-2xl text-base leading-7 text-white/70 sm:text-lg md:text-xl md:leading-8">
              {content.description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={content.primaryHref}
                className="btn glass-card inline-flex w-full justify-center bg-[#6366f1]/15 border-[#6366f1]/20 text-white shadow-[0_20px_80px_rgba(99,102,241,0.12)] sm:w-auto"
              >
                {content.primary}
              </Link>
              <Link href={content.secondaryHref} className="btn glass-card hidden bg-white/10 border-white/10 text-white sm:inline-flex">
                {content.secondary}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="relative hidden shrink-0 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:block"
          >
            <div className="hero-accent rounded-3xl border border-white/10 bg-gradient-to-br from-[#4338ca]/25 to-[#0f172a]/20 p-6">
              <div className="relative h-40 w-40">
                <Image src="/hero-accent.svg" alt="MangystauTrails accent" fill sizes="(max-width: 768px) 180px, 240px" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
