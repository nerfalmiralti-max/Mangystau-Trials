"use client";

import { motion } from "framer-motion";
import AnimatedHero from "../components/AnimatedHero";
import AnimatedTitle from "../components/AnimatedTitle";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="home" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-10"
        >
          <AnimatedTitle text="Home" className="text-3xl md:text-4xl" />

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="glass-card p-8">
              <p className="text-lg leading-8 text-white/70">
                NomadGo сочетает фирменный минимализм, плавные анимации и современный travel-tech подход к маршрутам.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/40">Маршруты</p>
                  <p className="mt-3 text-2xl font-semibold">5+</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/40">Чат</p>
                  <p className="mt-3 text-2xl font-semibold">Мгновенный ответ</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Тонкий UX</p>
                <p className="mt-3 text-white/70">
                  Плавные переходы, микровзаимодействия и современный вид без громоздких блоков.
                </p>
              </div>
              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Производительность</p>
                <p className="mt-3 text-white/70">
                  Оптимизировано для мобильных устройств и App Router, чтобы интерфейс оставался отзывчивым.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center text-white/40 text-xs py-6 tracking-widest font-semibold"
      >
        Made by 2Starks
      </motion.footer>
    </div>
  );
}
