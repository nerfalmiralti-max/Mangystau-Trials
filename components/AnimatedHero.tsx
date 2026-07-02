"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedTitle from "./AnimatedTitle";
import DigitalMountainsBackground from "./DigitalMountainsBackground";

type TabKey = "home" | "routes" | "explore" | "locations" | "chat" | "profile";

type AnimatedHeroProps = {
  activeTab: TabKey;
};

const tabs: { id: TabKey; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "routes", label: "Routes", href: "/routes" },
  { id: "explore", label: "Explore", href: "/explore" },
  { id: "locations", label: "Locations", href: "/locations" },
  { id: "chat", label: "Chat", href: "/chat" },
  { id: "profile", label: "Profile", href: "/profile" },
];

const mobileTabs: { id: TabKey; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "explore", label: "Map", href: "/explore" },
  { id: "routes", label: "Route", href: "/routes" },
  { id: "locations", label: "Places", href: "/locations" },
  { id: "chat", label: "AI", href: "/chat" },
  { id: "profile", label: "Me", href: "/profile" },
];

const authLinks = [
  { label: "Log in", href: "/profile?mode=login", primary: false },
  { label: "Sign up", href: "/profile?mode=register", primary: true },
];

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
    secondary: "Ask assistant",
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
    title: "Ask a travel assistant before you go",
    description:
      "Get quick planning help for seasons, transport, safety, packing and the kind of Kazakhstan route that matches your travel style.",
    primary: "Ask a question",
    primaryHref: "/chat",
    secondary: "Plan route",
    secondaryHref: "/routes",
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
};

export default function AnimatedHero({ activeTab }: AnimatedHeroProps) {
  const content = heroContent[activeTab];

  return (
    <section className="relative isolate min-h-[82svh] overflow-hidden pb-28 md:min-h-screen md:pb-20">
      <DigitalMountainsBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),transparent_22%),linear-gradient(180deg,rgba(7,7,7,0.18),rgba(7,7,7,0.85))] pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pt-4 sm:px-6 md:px-8 md:pt-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">MangystauTrails</p>
            <p className="max-w-xl text-sm leading-6 text-white/60">
              Plan Kazakhstan routes with a modern travel-tech interface focused on Mangystau, city stops and wild landscapes.
            </p>
          </div>

          <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
            <nav className="flex flex-wrap items-center justify-start gap-2" aria-label="Primary navigation">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`btn header-nav-button ${activeTab === tab.id ? "btn-active" : "bg-white/5 text-white/90"}`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex shrink-0 items-center justify-end gap-2">
              {authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`btn header-nav-button ${
                    link.primary ? "btn-active" : "border-white/14 bg-white/5 text-white/90"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
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

      <nav className="fixed inset-x-0 bottom-3 z-50 px-3 md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-[430px] grid-cols-6 gap-1 rounded-[22px] border border-white/12 bg-[#0b0b0b]/88 p-1 shadow-[0_18px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          {mobileTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex min-w-0 items-center justify-center rounded-[18px] px-1.5 py-2 text-[10px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                  isActive
                    ? "bg-white text-black shadow-[0_8px_22px_rgba(255,255,255,0.14)]"
                    : "text-white/58 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="truncate">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </section>
  );
}
