"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedHero from "../../components/AnimatedHero";
import AnimatedTitle from "../../components/AnimatedTitle";
import { PLACES } from "../../lib/siteData";

export default function ExplorePage() {
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="explore" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-10"
        >
          <AnimatedTitle text="Explore" className="text-3xl md:text-4xl" />
          <div className="grid gap-4 md:grid-cols-2">
            {PLACES.map((place) => (
              <motion.div
                key={place.name}
                className="glass-card cursor-pointer"
                onClick={() => setOpened(opened === place.name ? null : place.name)}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 170, damping: 22 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{place.name}</h3>
                    <p className="text-white/60">{place.desc}</p>
                  </div>
                  <span className="text-sm uppercase tracking-[0.2em] text-white/40">Explore</span>
                </div>
                {opened === place.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-5 space-y-3 border-t border-white/10 pt-4"
                  >
                    <p className="text-white/70 leading-7">{place.bio}</p>
                    <div className="grid gap-2 text-sm text-white/60">
                      {place.facts.map((fact) => (
                        <p key={fact}>• {fact}</p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
