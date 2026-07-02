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
    <section className="relative isolate min-h-screen overflow-hidden pb-20">
      <DigitalMountainsBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),transparent_22%),linear-gradient(180deg,rgba(7,7,7,0.18),rgba(7,7,7,0.85))] pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 pt-6 sm:px-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">MangystauTrails</p>
            <p className="max-w-xl text-sm text-white/60">
              Plan Kazakhstan routes with a modern travel-tech interface focused on Mangystau, city stops and wild landscapes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center justify-start gap-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`btn header-nav-button ${activeTab === tab.id ? "btn-active" : "bg-white/5 text-white/90"}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

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

        <div className="mt-16 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl space-y-8"
          >
            <AnimatedTitle
              text={content.title}
              className="text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.95]"
            />
            <p className="max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={content.primaryHref}
                className="btn glass-card bg-[#6366f1]/15 border-[#6366f1]/20 text-white shadow-[0_20px_80px_rgba(99,102,241,0.12)]"
              >
                {content.primary}
              </Link>
              <Link href={content.secondaryHref} className="btn glass-card bg-white/10 border-white/10 text-white">
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
