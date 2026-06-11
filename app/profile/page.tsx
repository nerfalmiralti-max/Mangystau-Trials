"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedHero from "../../components/AnimatedHero";
import AnimatedTitle from "../../components/AnimatedTitle";

type AuthMode = "login" | "register";

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

const emptyForm = {
  name: "",
  email: "",
  password: "",
  country: "",
};

export default function ProfilePage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState(emptyForm);
  const [tourist, setTourist] = useState<TouristProfile | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return;

        const data = await response.json();
        setTourist(data.tourist ?? null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Authentication failed. Please try again.");
        return;
      }

      setTourist(data.tourist);
      setForm(emptyForm);
      setMessage(mode === "register" ? "Account created. Welcome to MangystauTrails." : "Welcome back.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setTourist(null);
    setMode("login");
    setMessage("You are signed out.");
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="profile" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text="Tourist Profile" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl leading-8 text-white/70">
              Sign in with email and password to keep your MangystauTrails routes,
              visits and travel profile in one place.
            </p>
          </div>

          {tourist ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="glass-card p-8">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Your account</p>
                <h3 className="mt-4 text-2xl font-semibold">{tourist.name || "MangystauTrails Traveler"}</h3>
                <div className="mt-5 grid gap-3 text-white/70">
                  <p>{tourist.email}</p>
                  <p>{tourist.country || "Country not set"}</p>
                  <p>Member since {new Date(tourist.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={logout} className="btn chat-button mt-6">
                  Sign out
                </button>
              </div>

              <div className="glass-card p-8">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Activity</p>
                <div className="mt-6 grid gap-4">
                  {(tourist.visits ?? []).length > 0 ? (
                    tourist.visits?.map((visit) => (
                      <div key={visit.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/60">Visited place</p>
                        <p className="mt-3 text-lg font-semibold">{visit.place?.name || "Kazakhstan route"}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/60">Latest route</p>
                      <p className="mt-3 text-lg font-semibold">No saved visits yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="glass-card p-8">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Tourist access</p>
                <h3 className="mt-4 text-2xl font-semibold">
                  {mode === "login" ? "Sign in to your route space" : "Create your tourist account"}
                </h3>
                <p className="mt-4 leading-7 text-white/70">
                  {mode === "login"
                    ? "Use your email and password to return to your routes and travel history."
                    : "No account yet? Register with your email, password and travel name to start saving your journey."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/5 p-2">
                  {(["login", "register"] as AuthMode[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setMode(item);
                        setMessage("");
                      }}
                      className={`btn ${mode === item ? "btn-active" : "bg-white/5 text-white/80"}`}
                    >
                      {item === "login" ? "Sign in" : "Register"}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={submitAuth} className="glass-card p-8">
                <div className="grid gap-4">
                  {mode === "register" && (
                    <>
                      <label className="grid gap-2">
                        <span className="text-sm text-white/60">Tourist name</span>
                        <input
                          value={form.name}
                          onChange={(event) => updateForm("name", event.target.value)}
                          className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-4 text-white outline-none focus:border-white/30"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm text-white/60">Country</span>
                        <input
                          value={form.country}
                          onChange={(event) => updateForm("country", event.target.value)}
                          className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-4 text-white outline-none focus:border-white/30"
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
                      className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-4 text-white outline-none focus:border-white/30"
                      placeholder="tourist@example.com"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm text-white/60">Password</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => updateForm("password", event.target.value)}
                      className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-4 text-white outline-none focus:border-white/30"
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
                  {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
