"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import { useStoredIds } from "@/components/useStoredIds";
import {
  GUIDE_FAVORITES_KEY,
  LOCAL_AUTH_SESSION_KEY,
  LOCAL_AUTH_USERS_KEY,
  LOCATION_FAVORITES_KEY,
  SAVED_HOTELS_KEY,
  SAVED_ROUTES_KEY,
} from "@/lib/appStorage";

type AuthFormMode = "login" | "register";

type TouristProfile = {
  id: string;
  name: string | null;
  email: string | null;
  country: string | null;
  createdAt: string;
  visits?: {
    id: string;
    createdAt: string;
    place?: {
      name: string;
    } | null;
  }[];
};

type LocalAuthUser = {
  id: string;
  name: string;
  email: string;
  country: string;
  password: string;
  createdAt: string;
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  country: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileClient() {
  const [mode, setMode] = useState<AuthFormMode>(() => {
    if (typeof window === "undefined") return "login";

    const initialMode = new URLSearchParams(window.location.search).get("mode");
    return initialMode === "register" ? "register" : "login";
  });
  const [form, setForm] = useState(emptyForm);
  const [tourist, setTourist] = useState<TouristProfile | null>(null);
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
      const nextTourist = handleLocalAuth(mode, form);

      if ("error" in nextTourist) {
        setMessage(nextTourist.error ?? "Authentication failed. Please try again.");
        return;
      }

      setTourist(nextTourist.tourist);
      setForm(emptyForm);
      setMessage(mode === "register" ? "Account created. Welcome to MangystauTrails." : "Welcome back.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    window.localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setTourist(null);
    setMode("login");
    setMessage("You are signed out.");
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
            <AnimatedTitle text="Tourist Profile" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Account access, saved trip context and session control in one compact place.
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
                    <p className="text-xs uppercase tracking-[0.22em] text-white/40">Profile</p>
                    <h3 className="mt-2 truncate text-xl font-semibold text-white md:text-2xl">
                      {tourist.name || "MangystauTrails Traveler"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-white/58">{tourist.email}</p>
                  </div>
                </div>
                <button onClick={logout} className="btn chat-button justify-center">
                  Logout
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <ProfileStat label="Saved" value={savedCount.toString()} />
                <ProfileStat label="Trips" value={(tourist.visits ?? []).length.toString()} />
                <ProfileStat label="Routes" value={savedRouteIds.length.toString()} />
                <ProfileStat label="Since" value={new Date(tourist.createdAt).getFullYear().toString()} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoLine label="Name" value={tourist.name || "Not set"} />
                <InfoLine label="Email" value={tourist.email || "Not set"} />
                <InfoLine label="Country" value={tourist.country || "Not set"} />
                <InfoLine label="Session" value="Active" />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="glass-card p-5 md:p-8">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Tourist access</p>
                <h3 className="mt-4 text-xl font-semibold md:text-2xl">
                  {mode === "login" ? "Log in to your route space" : "Sign up for smarter trips"}
                </h3>
                <p className="mt-4 leading-7 text-white/70">
                  {mode === "login"
                    ? "Use your email and password to return to saved routes, visited places and your travel profile."
                    : "Create an account to save generated routes, remember your travel style and build future Kazakhstan plans faster."}
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
                      {item === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={submitAuth} className="glass-card p-5 md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/40">
                      {mode === "login" ? "Welcome back" : "New traveler"}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold md:text-2xl">
                      {mode === "login" ? "Log in" : "Sign up"}
                    </h3>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
                    7-day secure session
                  </div>
                </div>

                <div className="grid gap-4">
                  {mode === "register" && (
                    <>
                      <label className="grid gap-2">
                        <span className="text-sm text-white/60">Tourist name</span>
                        <input
                          value={form.name}
                          onChange={(event) => updateForm("name", event.target.value)}
                          className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30 md:py-4"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm text-white/60">Country</span>
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
                    <span className="text-sm text-white/60">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30 md:py-4"
                      placeholder="tourist@example.com"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-white/60">Password</span>
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
                  {isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
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

function handleLocalAuth(mode: AuthFormMode, form: typeof emptyForm) {
  const email = normalizeEmail(form.email);
  const password = form.password;

  if (!email || !password || !emailPattern.test(email)) {
    return { error: "Use a valid email and password." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (mode === "register") {
    const name = form.name.trim();

    if (!name) {
      return { error: "Name, email and password are required." };
    }

    const users = readLocalUsers();
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return { error: "A tourist account with this email already exists." };
    }

    const user: LocalAuthUser = {
      id: createLocalId(),
      name,
      email,
      country: form.country.trim(),
      password,
      createdAt: new Date().toISOString(),
    };

    writeLocalUsers([user, ...users]);
    writeLocalSession(user.id);

    return { tourist: toTouristProfile(user) };
  }

  const user = readLocalUsers().find((item) => item.email === email && item.password === password);

  if (!user) {
    return { error: "Incorrect email or password." };
  }

  writeLocalSession(user.id);

  return { tourist: toTouristProfile(user) };
}

function readLocalSession() {
  const sessionUserId = window.localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
  const user = readLocalUsers().find((item) => item.id === sessionUserId);

  return user ? toTouristProfile(user) : null;
}

function writeLocalSession(userId: string) {
  window.localStorage.setItem(LOCAL_AUTH_SESSION_KEY, userId);
}

function readLocalUsers() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_AUTH_USERS_KEY) ?? "[]");

    return Array.isArray(parsed)
      ? parsed.filter((item): item is LocalAuthUser => isLocalAuthUser(item))
      : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalAuthUser[]) {
  window.localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users.slice(0, 20)));
}

function isLocalAuthUser(value: unknown): value is LocalAuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<LocalAuthUser>;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.password === "string" &&
    typeof user.createdAt === "string"
  );
}

function toTouristProfile(user: LocalAuthUser): TouristProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    country: user.country || null,
    createdAt: user.createdAt,
    visits: [],
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitials(value: string) {
  return value
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "MT";
}
