"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import MapLoading from "@/components/MapLoading";
import RoutePlanner from "@/components/RoutePlanner";
import { ROUTES } from "@/lib/siteData";
import { POPULAR_MANGYSTAU_ROUTES } from "@/lib/tourismData";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function RoutesPage() {
  const [mapRouteIds, setMapRouteIds] = useState<string[]>(
    POPULAR_MANGYSTAU_ROUTES[0]?.placeIds ?? ROUTES[0].placeIds
  );

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="routes" />

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-8 md:space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text="Routes" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Generate a route to Kazakhstan attractions by trip length, travel pace and
              interest, then preview the path directly on the built-in map.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/40">Popular routes</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Aktau starts</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {POPULAR_MANGYSTAU_ROUTES.map((route) => {
                const isActive = mapRouteIds.join("-") === route.placeIds.join("-");

                return (
                  <button
                    key={route.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setMapRouteIds(route.placeIds)}
                    className={`glass-card p-4 text-left md:p-5 ${
                      isActive ? "border-white/30 bg-white/10" : ""
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {route.distance} / {route.duration}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-white">{route.title}</h3>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-white/62">{route.note}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {route.points.map((point, index) => (
                        <span
                          key={`${route.id}-${point}`}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/55"
                        >
                          {index + 1}. {point}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <RoutePlanner onRouteChange={setMapRouteIds} />

          <div id="route-map" className="glass-card scroll-mt-24 p-3 sm:p-4">
            <Map
              routeMode="route"
              routePlaceIds={mapRouteIds}
              startPlaceId={mapRouteIds[0]}
              destinationPlaceId={mapRouteIds[mapRouteIds.length - 1]}
            />
          </div>
        </motion.section>
      </main>
    </div>
  );
}
