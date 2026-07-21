"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import Link from "next/link";

import AnimatedHero from "../components/AnimatedHero";
import AnimatedTitle from "../components/AnimatedTitle";
import ContactForm from "@/components/ContactForm";
import TabDescription from "@/components/TabDescription";
import { getMangystauDestinations } from "@/lib/tourismData";
import { useSettings } from "@/hooks/useSettings";

export default function Home() {
  const { formatNumber, translate, tx } = useSettings();
  const popularPlaces = useMemo(() => getMangystauDestinations().slice(0, 4), []);

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="home" />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-10 md:space-y-14"
        >
          <div className="space-y-3">
            <AnimatedTitle text={tx("Home")} className="text-3xl md:text-4xl" />
            <TabDescription type="home" title="Home" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="glass-card space-y-6 p-5 md:p-8">
              <p className="text-base leading-7 text-white/70 md:text-lg md:leading-8">
                {tx("MangystauTrails is a practical travel platform that builds personalized routes across Kazakhstan in seconds, combining smart recommendations, real locations, and adaptive planning.")}
              </p>
            </div>
          </div>

          {/* DESTINATIONS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">{tx("Popular destinations")}</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popularPlaces.map(({ place, profile }) => (
                <Link
                  key={place.id}
                  href={`/locations/${place.id}`}
                  className="glass-card min-h-32 p-4 transition md:p-5"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/38">
                    {place.region} / {profile.categoryLabel}
                  </p>
                  <p className="mt-3 text-base font-semibold text-white/90">{place.name}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/58">
                    {place.desc}
                  </p>
                  <p className="mt-3 text-xs text-white/45">
                    {tx("Editorial score {score} / 5 · {time}", {
                      score: formatNumber(profile.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                      time: translate(profile.visitTime),
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Link
              href="/explore"
              className="inline-flex w-full justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-80 sm:w-auto"
            >
              {tx("Start exploring Kazakhstan")}
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="glass-card p-5 md:p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-white/40">{tx("Trip support")}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{tx("Plan with MangystauTrails")}</h2>
              <p className="mt-4 text-sm leading-7 text-white/65 md:text-base">
                {tx("Share your dates, pace and dream stops. Your request is saved with the practical details needed to shape a Mangystau journey around your group.")}
              </p>
            </div>

            <ContactForm />
          </div>
        </motion.section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-white/40 text-xs py-6"
      >
        {tx("Made by 2Starks")}
      </motion.footer>
    </div>
  );
}
