"use client";

import { motion } from "framer-motion";
import AnimatedHero from "../../components/AnimatedHero";
import AnimatedTitle from "../../components/AnimatedTitle";
import { ROUTES } from "../../lib/siteData";

export default function RoutesPage() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="routes" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-10"
        >
          <AnimatedTitle text="Routes" className="text-3xl md:text-4xl" />
          <div className="grid gap-5 md:grid-cols-2">
            {ROUTES.map((route) => (
              <motion.div
                key={route.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
                className="glass-card p-6"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Route</p>
                <h3 className="mt-3 text-2xl font-semibold">{route.title}</h3>
                <p className="mt-3 leading-7 text-white/70">{route.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
