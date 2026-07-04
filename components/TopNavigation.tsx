"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type TabKey =
  | "home"
  | "routes"
  | "explore"
  | "locations"
  | "chat"
  | "settings"
  | "saved"
  | "offline"
  | "profile"
  | "help"
  | "about";

type TopNavigationProps = {
  activeTab: TabKey;
};

const tabs: { id: TabKey; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "routes", label: "Routes", href: "/routes" },
  { id: "explore", label: "Explore", href: "/explore" },
  { id: "locations", label: "Locations", href: "/locations" },
  { id: "chat", label: "Guide", href: "/chat" },
];

const mobileTabs: { id: TabKey; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "explore", label: "Map", href: "/explore" },
  { id: "routes", label: "Route", href: "/routes" },
  { id: "locations", label: "Places", href: "/locations" },
  { id: "chat", label: "Guide", href: "/chat" },
];

const drawerLinks: { id: TabKey; label: string; href: string; meta: string; icon: string }[] = [
  { id: "home", label: "Home", href: "/", meta: "Start", icon: "\u2302" },
  { id: "settings", label: "Settings", href: "/settings", meta: "Preferences", icon: "\u2699" },
  { id: "saved", label: "Saved", href: "/saved", meta: "Places, hotels, routes", icon: "\u2605" },
  { id: "offline", label: "Offline", href: "/offline", meta: "Guides and maps", icon: "\u21e9" },
  { id: "profile", label: "Profile", href: "/profile", meta: "Account", icon: "\u25c9" },
  { id: "help", label: "Help & FAQ", href: "/help", meta: "Support", icon: "?" },
  { id: "about", label: "About", href: "/about", meta: "2Starks", icon: "i" },
];

export default function TopNavigation({ activeTab }: TopNavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const pathname = usePathname();

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

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeBySwipe = (clientX: number) => {
    if (touchStartX.current === null) {
      return;
    }

    if (clientX - touchStartX.current > 58) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
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
        <div className="pointer-events-auto mx-auto flex max-w-7xl items-center gap-2 rounded-[22px] border border-white/12 bg-[#0b0b0b]/72 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0b0b0b]/58 md:gap-3 md:rounded-full">
          <Link
            href="/"
            className="hidden shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/72 transition hover:bg-white/8 hover:text-white md:inline-flex"
          >
            MangystauTrails
          </Link>

          <nav aria-label="Primary navigation" className="min-w-0 flex-1">
            <div className="grid grid-cols-5 gap-1 md:hidden">
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

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/8 text-lg font-semibold text-white transition hover:bg-white/14 md:h-11 md:w-11 md:rounded-full"
          >
            {"\u2630"}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[70] bg-black/58 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Secondary navigation"
              className="fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-[360px] flex-col border-l border-white/10 bg-[#0b0b0b]/94 p-4 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null;
              }}
              onTouchMove={(event) => closeBySwipe(event.touches[0]?.clientX ?? 0)}
              onTouchEnd={() => {
                touchStartX.current = null;
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="min-w-0 rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/72"
                >
                  MangystauTrails
                </Link>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-xl text-white/80 transition hover:bg-white/14"
                >
                  {"\u00d7"}
                </button>
              </div>

              <nav aria-label="Menu" className="mt-4 grid gap-2">
                {drawerLinks.map((item) => {
                  const isActive =
                    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMenuOpen(false)}
                      className={`rounded-[18px] border px-4 py-3 transition ${
                        isActive
                          ? "border-white/18 bg-white text-black"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${
                            isActive ? "border-black/10 bg-black/6" : "border-white/10 bg-white/6"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className={`mt-1 block truncate text-xs ${isActive ? "text-black/58" : "text-white/42"}`}>
                            {item.meta}
                          </span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/38">Quick access</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href="/profile?mode=login" onClick={() => setIsMenuOpen(false)} className="btn justify-center text-center">
                    Log in
                  </Link>
                  <Link href="/profile?mode=register" onClick={() => setIsMenuOpen(false)} className="btn btn-active justify-center text-center">
                    Sign up
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
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
