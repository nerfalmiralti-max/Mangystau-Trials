"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import { useStoredIds } from "@/components/useStoredIds";
import { useSettings } from "@/hooks/useSettings";
import {
  GUIDE_FAVORITES_KEY,
  LOCATION_FAVORITES_KEY,
  SAVED_HOTELS_KEY,
  SAVED_ROUTES_KEY,
} from "@/lib/appStorage";
import {
  clearLocalSession,
  loginLocal,
  readLocalSession,
  signUpLocal,
  type LocalAuthProfile,
} from "@/lib/localAuth";

type AuthFormMode = "login" | "register";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  country: "",
};

export default function ProfileClient() {
  const { t } = useSettings();
  const router = useRouter();
  const [mode, setMode] = useState<AuthFormMode>(() => {
    if (typeof window === "undefined") return "login";

    const initialMode = new URLSearchParams(window.location.search).get("mode");
    return initialMode === "register" ? "register" : "login";
  });
  const [form, setForm] = useState(emptyForm);
  const [tourist, setTourist] = useState<LocalAuthProfile | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const guideFavoriteIds = useStoredIds(GUIDE_FAVORITES_KEY);
  const locationFavoriteIds = useStoredIds(LOCATION_FAVORITES_KEY);
  const savedHotelIds = useStoredIds(SAVED_HOTELS_KEY);
  const savedRouteIds = useStoredIds(SAVED_ROUTES_KEY);
  const savedPlaceCount = useMemo(
    () => new Set([...guideFavoriteIds, ...locationFavoriteIds]).size,
    [guideFavoriteIds, locationFavoriteIds]
  );
  const savedCount = savedPlaceCount + savedHotelIds.length + savedRouteIds.length;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setTourist(readLocalSession());
      setIsLoading(false);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const nextTourist = mode === "register" ? signUpLocal(form) : loginLocal(form);

      if ("error" in nextTourist) {
        setMessage(nextTourist.error ?? "Authentication failed. Please try again.");
        return;
      }

      setTourist(nextTourist.tourist);
      setForm(emptyForm);
      setMessage(mode === "register" ? t("profile.accountCreated") : t("profile.welcome"));
      router.replace("/profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    clearLocalSession();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setTourist(null);
    setMode("login");
    setMessage(t("profile.signedOut"));
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="profile" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-8 md:space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text={t("profile.title")} className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              {t("profile.description")}
            </p>
          </div>

          {tourist ? (
            <div className="glass-card p-5 md:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white text-xl font-semibold text-black">
                    {getInitials(tourist.name || tourist.email || "MT")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">{t("profile.label")}</p>
                    <h3 className="mt-2 truncate text-xl font-semibold text-white md:text-2xl">
                      {tourist.name || "MangystauTrails Traveler"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-white/58">{tourist.email}</p>
                  </div>
                </div>
                <button onClick={logout} className="btn chat-button justify-center">
                  {t("auth.logout")}
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <ProfileStat label={t("profile.saved")} value={savedCount.toString()} />
                <ProfileStat label={t("profile.trips")} value={(tourist.visits ?? []).length.toString()} />
                <ProfileStat label={t("profile.routes")} value={savedRouteIds.length.toString()} />
                <ProfileStat label={t("profile.since")} value={new Date(tourist.createdAt).getFullYear().toString()} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoLine label={t("profile.name")} value={tourist.name || t("profile.notSet")} />
                <InfoLine label={t("profile.email")} value={tourist.email || t("profile.notSet")} />
                <InfoLine label={t("profile.country")} value={tourist.country || t("profile.notSet")} />
                <InfoLine label={t("profile.session")} value={t("profile.active")} />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="glass-card p-5 md:p-8">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">{t("profile.touristAccess")}</p>
                <h3 className="mt-4 text-xl font-semibold md:text-2xl">
                  {mode === "login" ? t("profile.loginTitle") : t("profile.signupTitle")}
                </h3>
                <p className="mt-4 leading-7 text-white/70">
                  {mode === "login" ? t("profile.loginCopy") : t("profile.signupCopy")}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/5 p-2">
                  {(["login", "register"] as AuthFormMode[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setMode(item);
                        setMessage("");
                      }}
                      className={`btn ${mode === item ? "btn-active" : "bg-white/5 text-white/80"}`}
                    >
                      {item === "login" ? t("auth.login") : t("auth.signup")}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={submitAuth} className="glass-card p-5 md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/40">
                      {mode === "login" ? t("profile.welcomeBack") : t("profile.newTraveler")}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold md:text-2xl">
                      {mode === "login" ? t("auth.login") : t("auth.signup")}
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
                    {t("profile.sessionNote")}
                  </div>
                </div>

                <div className="grid gap-4">
                  {mode === "register" && (
                    <>
                      <label className="grid gap-2">
                        <span className="text-sm text-white/60">{t("profile.touristName")}</span>
                        <input
                          value={form.name}
                          onChange={(event) => updateForm("name", event.target.value)}
                          className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30 md:py-4"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm text-white/60">{t("profile.country")}</span>
                        <input
                          value={form.country}
                          onChange={(event) => updateForm("country", event.target.value)}
                          className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30 md:py-4"
                          placeholder="Kazakhstan, Turkey, USA..."
                        />
                      </label>
                    </>
                  )}

                  <label className="grid gap-2">
                    <span className="text-sm text-white/60">{t("profile.email")}</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30 md:py-4"
                      placeholder="tourist@example.com"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-white/60">{t("profile.password")}</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => updateForm("password", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30 md:py-4"
                      placeholder="At least 8 characters"
                    />
                  </label>
                </div>

                {message && (
                  <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    {message}
                  </p>
                )}

                <button disabled={isSubmitting || isLoading} className="btn chat-button mt-6 w-full disabled:opacity-50">
                  {isSubmitting ? t("auth.pleaseWait") : mode === "login" ? t("auth.login") : t("auth.createAccount")}
                </button>
              </form>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
      <p className="text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">{label}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-white/45">{label}</span>
      <span className="truncate text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "MT";
}
