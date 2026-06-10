"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AnimatedHero from "../components/AnimatedHero";
import AnimatedTitle from "../components/AnimatedTitle";
import TabDescription from "@/components/TabDescription";

export default function Home() {
  const router = useRouter();
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="home" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-14"
        >
          {/* HERO TEXT */}
          <div className="space-y-3">
            <AnimatedTitle text="Home" className="text-3xl md:text-4xl" />
            <TabDescription type="home" title="Home" />
          </div>

          {/* MAIN BLOCK */}
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="glass-card p-8 space-y-6">
              <p className="text-lg leading-8 text-white/70">
                NomadGo is an AI-powered travel platform that builds personalized routes across Kazakhstan in seconds — combining smart recommendations, real locations, and adaptive planning.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/40">Routes</p>
                  <p className="mt-3 text-2xl font-semibold">AI Generated</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/40">Assistant</p>
                  <p className="mt-3 text-2xl font-semibold">24/7 Smart Chat</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Experience</p>
                <p className="mt-3 text-white/70">
                  Smooth UX with modern animations and minimal interface focused on clarity.
                </p>
              </div>

              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Performance</p>
                <p className="mt-3 text-white/70">
                  Optimized for fast loading and mobile-first experience using Next.js App Router.
                </p>
              </div>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">How it works</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-card p-5">
                <p className="text-white/70">1. Enter your preferences</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/70">2. AI builds your route</p>
              </div>
              <div className="glass-card p-5">
                <p className="text-white/70">3. Start exploring Kazakhstan</p>
              </div>
            </div>
          </div>

          {/* DESTINATIONS (API VERSION) */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Popular destinations</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {places.length === 0 ? (
                <p className="text-white/40">Loading destinations...</p>
              ) : (
                places.slice(0, 4).map((place) => (
                  <div
                    key={place.id}
                    className="glass-card p-5 hover:scale-[1.03] transition"
                  >
                    <p className="text-white/80">{place.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-6">
            <button
              onClick={() => router.push("/explore")}
              className="px-6 py-3 rounded-2xl bg-white text-black font-semibold hover:opacity-80 transition"
            >
              Start exploring Kazakhstan →
            </button>
          </div>
        </motion.section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-white/40 text-xs py-6"
      >
        Made by 2Starks
      </motion.footer>
    </div>
  );
}
