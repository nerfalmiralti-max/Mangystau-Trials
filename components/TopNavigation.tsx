"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/hooks/useSettings";

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

export default function TopNavigation({ activeTab }: TopNavigationProps) {
  const { t } = useSettings();
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuDialogRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const tabs: { id: TabKey; label: string; href: string }[] = [
    { id: "home", label: t("nav.home"), href: "/" },
    { id: "routes", label: t("nav.routes"), href: "/routes" },
    { id: "explore", label: t("nav.explore"), href: "/explore" },
    { id: "locations", label: t("nav.locations"), href: "/locations" },
    { id: "chat", label: t("nav.guide"), href: "/chat" },
  ];
  const mobileTabs: { id: TabKey; label: string; href: string; icon: string }[] = [
    { id: "home", label: t("nav.home"), href: "/", icon: "⌂" },
    { id: "explore", label: t("nav.map"), href: "/explore", icon: "⌖" },
    { id: "routes", label: t("nav.route"), href: "/routes", icon: "↗" },
    { id: "saved", label: t("nav.saved"), href: "/saved", icon: "☆" },
    { id: "chat", label: t("nav.guide"), href: "/chat", icon: "?" },
  ];
  const drawerLinks: { id: TabKey; label: string; href: string; meta: string; icon: string }[] = [
    { id: "home", label: t("nav.home"), href: "/", meta: t("nav.start"), icon: "\u2302" },
    { id: "locations", label: t("nav.locations"), href: "/locations", meta: "Destination guides", icon: "\u25c7" },
    { id: "settings", label: t("nav.settings"), href: "/settings", meta: t("nav.preferences"), icon: "\u2699" },
    { id: "saved", label: t("nav.saved"), href: "/saved", meta: t("nav.savedMeta"), icon: "\u2605" },
    { id: "offline", label: t("nav.offline"), href: "/offline", meta: t("nav.offlineMeta"), icon: "\u21e9" },
    { id: "profile", label: t("nav.profile"), href: "/profile", meta: t("nav.account"), icon: "\u25c9" },
    { id: "help", label: t("nav.help"), href: "/help", meta: t("nav.support"), icon: "?" },
    { id: "about", label: t("nav.about"), href: "/about", meta: "2Starks", icon: "i" },
  ];

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY.current;

      if (currentScrollY < 24) {
        setIsVisible(true);
      } else if (Math.abs(scrollDelta) > 8) {
        const headerHasFocus = headerRef.current?.contains(document.activeElement) ?? false;
        setIsVisible(scrollDelta < 0 || headerHasFocus);
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

    const originalOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";

    window.requestAnimationFrame(() => {
      menuDialogRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (event.key === "Tab" && menuDialogRef.current) {
        const focusable = Array.from(
          menuDialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        const first = focusable[0];
        const last = focusable.at(-1);

        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      (previouslyFocused ?? menuButton)?.focus();
    };
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
        ref={headerRef}
        onFocusCapture={() => setIsVisible(true)}
        aria-hidden={!isVisible}
        inert={!isVisible}
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
            className="inline-flex min-h-11 min-w-0 shrink items-center rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/78 transition hover:bg-white/8 hover:text-white sm:text-xs md:px-4 md:tracking-[0.22em]"
          >
            Mangystau<span className="text-[#d8c29f]">Trails</span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 md:block">
            <div className="flex items-center justify-center gap-1.5">
              {tabs.map((tab) => (
                <NavigationLink key={tab.id} tab={tab} isActive={activeTab === tab.id} />
              ))}
            </div>
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("mangystau:close-overlays"));
              setIsMenuOpen(true);
            }}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/8 text-lg font-semibold text-white transition hover:bg-white/14 md:rounded-full"
          >
            {"\u2630"}
          </button>
        </div>
      </motion.header>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-[60] grid grid-cols-5 rounded-[22px] border border-white/12 bg-[#0b0b0b]/88 p-1.5 shadow-[0_20px_55px_rgba(0,0,0,0.48)] backdrop-blur-2xl md:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
      >
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[16px] px-1 text-[10px] font-semibold transition ${
                isActive ? "bg-white text-black" : "text-white/58 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span aria-hidden="true" className="text-base leading-none">{tab.icon}</span>
              <span className="max-w-full truncate">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

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
              ref={menuDialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Secondary navigation"
              className="fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-[360px] flex-col overflow-y-auto border-l border-white/10 bg-[#0b0b0b]/94 p-4 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-xl text-white/80 transition hover:bg-white/14"
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
                <p className="text-xs uppercase tracking-[0.2em] text-white/38">{t("nav.quickAccess")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href="/profile?mode=login" onClick={() => setIsMenuOpen(false)} className="btn justify-center text-center">
                    {t("auth.login")}
                  </Link>
                  <Link href="/profile?mode=register" onClick={() => setIsMenuOpen(false)} className="btn btn-active justify-center text-center">
                    {t("auth.signup")}
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
      aria-current={isActive ? "page" : undefined}
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
