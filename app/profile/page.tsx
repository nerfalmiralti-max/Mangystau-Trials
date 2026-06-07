"use client";

import { motion } from "framer-motion";
import AnimatedHero from "../../components/AnimatedHero";
import AnimatedTitle from "../../components/AnimatedTitle";

export default function ProfilePage() {
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
          <AnimatedTitle text="Profile" className="text-3xl md:text-4xl" />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="glass-card p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-white/40">Ваш профиль</p>
              <h3 className="mt-4 text-2xl font-semibold">NomadGo Traveler</h3>
              <p className="mt-4 leading-7 text-white/70">
                Легко управляйте своими маршрутами, сохраняйте любимые места и быстро возвращайтесь к рекомендациям.
              </p>
            </div>
            <div className="glass-card p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-white/40">Активность</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Последний маршрут</p>
                  <p className="mt-3 text-lg font-semibold">Astana Sprint</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">Сохраненные места</p>
                  <p className="mt-3 text-lg font-semibold">4 локации</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
