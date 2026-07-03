"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type TabKey = "home" | "routes" | "explore" | "locations" | "chat" | "profile";

type TopNavigationProps = {
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

export default function TopNavigation({ activeTab }: TopNavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (currentScrollY < 24) {
        setIsVisible(true);
      } else if (Math.abs(scrollDelta) > 8) {
        setIsVisible(scrollDelta < 0);
      }

      lastScrollY.current = Math.max(currentScrollY, 0);
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateVisibility);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={false}
      animate={{
        y: isVisible ? 0 : -92,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="pointer-events-none fixed inset-x-0 z-50 px-3 md:px-5"
      style={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
    >
      <div className="pointer-events-auto mx-auto flex max-w-7xl items-center gap-3 rounded-[22px] border border-white/12 bg-[#0b0b0b]/72 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0b0b0b]/58 md:rounded-full">
        <Link
          href="/"
          className="hidden shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/72 transition hover:bg-white/8 hover:text-white md:inline-flex"
        >
          MangystauTrails
        </Link>

        <nav aria-label="Primary navigation" className="min-w-0 flex-1">
          <div className="grid grid-cols-6 gap-1 md:hidden">
            {mobileTabs.map((tab) => (
              <NavigationLink key={tab.id} tab={tab} isActive={activeTab === tab.id} />
            ))}
          </div>

          <div className="hidden items-center justify-center gap-1.5 md:flex">
            {tabs.map((tab) => (
              <NavigationLink key={tab.id} tab={tab} isActive={activeTab === tab.id} />
            ))}
          </div>
        </nav>

        <div className="hidden shrink-0 items-center gap-1.5 md:flex">
          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${
                link.primary
                  ? "bg-white text-black shadow-[0_12px_30px_rgba(255,255,255,0.16)]"
                  : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </motion.header>
  );
}

function NavigationLink({
  tab,
  isActive,
}: {
  tab: { id: TabKey; label: string; href: string };
  isActive: boolean;
}) {
  return (
    <Link
      href={tab.href}
      className={`flex min-h-10 min-w-0 items-center justify-center rounded-[18px] px-1.5 text-[11px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 md:min-h-0 md:rounded-full md:px-4 md:py-2 md:text-sm ${
        isActive
          ? "bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.15)]"
          : "text-white/62 hover:bg-white/8 hover:text-white"
      }`}
    >
      <span className="truncate">{tab.label}</span>
    </Link>
  );
}
