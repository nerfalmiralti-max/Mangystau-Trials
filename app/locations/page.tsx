"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import { PLACES } from "@/lib/siteData";

export default function LocationsPage() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="locations" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text="Destinations" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl leading-8 text-white/70">
              Explore detailed destination guides for Mangystau and the most iconic Kazakhstan travel
              stops. Every page includes practical info, safety tips, Leave No Trace reminders and
              an AI prompt for the route you want.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PLACES.map((place, index) => (
              <motion.article
                key={place.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group rounded-[22px] border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                      {place.region}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-white">{place.name}</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {place.category}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70">{place.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/60">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {place.duration}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    {place.bestTime}
                  </span>
                </div>
                <Link
                  href={`/locations/${place.id}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15"
                >
                  View guide
                  <span aria-hidden="true">→</span>
                </Link>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
