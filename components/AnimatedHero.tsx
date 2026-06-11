"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedTitle from "./AnimatedTitle";
import DigitalMountainsBackground from "./DigitalMountainsBackground";

type TabKey = "home" | "routes" | "explore" | "chat" | "profile";

type AnimatedHeroProps = {
  activeTab: TabKey;
};

const tabs: { id: TabKey; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "routes", label: "Routes", href: "/routes" },
  { id: "explore", label: "Explore", href: "/explore" },
  { id: "chat", label: "Chat", href: "/chat" },
  { id: "profile", label: "Profile", href: "/profile" },
];

export default function AnimatedHero({ activeTab }: AnimatedHeroProps) {
  return (
    <section className="relative isolate min-h-screen overflow-hidden pb-20">
      <DigitalMountainsBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),transparent_22%),linear-gradient(180deg,rgba(7,7,7,0.18),rgba(7,7,7,0.85))] pointer-events-none" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 pt-6 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">MangystauTrails</p>
            <p className="max-w-xl text-sm text-white/60">
              Plan Kazakhstan routes with a modern travel-tech interface focused on Mangystau, city stops and wild landscapes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
        </div>

        <div className="mt-16 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl space-y-8"
          >
            <AnimatedTitle
              text="Explore Kazakhstan with MangystauTrails"
              className="text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.95]"
            />
            <p className="max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
              A lightweight interface with live animation, AI travel chat and digital route planning for Kazakhstan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/explore"
                className="btn glass-card bg-[#6366f1]/15 border-[#6366f1]/20 text-white shadow-[0_20px_80px_rgba(99,102,241,0.12)]"
              >
                Start journey
              </Link>
              <Link href="/chat" className="btn glass-card bg-white/10 border-white/10 text-white">
                Ask a question
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
