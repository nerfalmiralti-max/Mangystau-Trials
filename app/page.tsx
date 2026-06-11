"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

import AnimatedHero from "../components/AnimatedHero";
import AnimatedTitle from "../components/AnimatedTitle";
import TabDescription from "@/components/TabDescription";
import { PLACES } from "@/lib/siteData";

type Place = {
  id: string;
  name: string;
};

export default function Home() {
  const [places, setPlaces] = useState<Place[]>(
    PLACES.map((place) => ({ id: place.id, name: place.name }))
  );

  useEffect(() => {
    fetch("/api/places")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPlaces(data.length > 0 ? data : PLACES.map((place) => ({ id: place.id, name: place.name })));
        } else if (Array.isArray(data?.places)) {
          setPlaces(data.places);
        } else if (Array.isArray(data?.data)) {
          setPlaces(data.data);
        } else {
          setPlaces(PLACES.map((place) => ({ id: place.id, name: place.name })));
        }
      })
      .catch(() => {
        setPlaces(PLACES.map((place) => ({ id: place.id, name: place.name })));
      });
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
          <div className="space-y-3">
            <AnimatedTitle text="Home" className="text-3xl md:text-4xl" />
            <TabDescription type="home" title="Home" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="glass-card p-8 space-y-6">
              <p className="text-lg leading-8 text-white/70">
                MangystauTrails is an AI-powered travel platform that builds personalized routes across Kazakhstan in seconds — combining smart recommendations, real locations, and adaptive planning.
              </p>
            </div>
          </div>

          {/* DESTINATIONS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Popular destinations</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.isArray(places) && places.length > 0 ? (
                places.slice(0, 4).map((place) => (
                  <div
                    key={place.id}
                    className="glass-card p-5 hover:scale-[1.03] transition"
                  >
                    <p className="text-white/80">{place.name}</p>
                  </div>
                ))
              ) : (
                <p className="text-white/40">Loading destinations...</p>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Link
              href="/explore"
              className="px-6 py-3 rounded-2xl bg-white text-black font-semibold hover:opacity-80 transition"
            >
              Start exploring Kazakhstan →
            </Link>
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
