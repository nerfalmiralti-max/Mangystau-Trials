"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import { PLACES, ROUTES } from "@/lib/siteData";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-white/50 sm:h-[520px] sm:rounded-[22px]">
      Loading map...
    </div>
  ),
});

export default function ExplorePage() {
  const allPlaceIds = PLACES.map((place) => place.id);
  const categories = useMemo(
    () => Array.from(new Set(PLACES.map((place) => place.category))),
    []
  );
  const [activeRouteIds, setActiveRouteIds] = useState<string[]>(allPlaceIds);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string>(PLACES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const showAllConnections = activeRouteIds.length === allPlaceIds.length;

  const selectedPlace = PLACES.find((place) => place.id === focusedPlaceId) ?? PLACES[0];

  const filteredPlaces = useMemo(() => {
    if (selectedCategory === "all") {
      return PLACES;
    }
    return PLACES.filter((place) => place.category === selectedCategory);
  }, [selectedCategory]);

  const selectRoute = (placeIds: string[]) => {
    setActiveRouteIds(placeIds);
    setFocusedPlaceId(placeIds[0] ?? PLACES[0].id);
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="explore" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-8 md:space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text="Explore" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Open Kazakhstan on an interactive map, scan every attraction path, then focus
              any route or destination before building your final plan.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="glass-card p-3 sm:p-4">
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`btn shrink-0 ${selectedCategory === "all" ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`btn shrink-0 ${selectedCategory === category ? "btn-active" : "bg-white/5 text-white/80"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <Map
                routePlaceIds={selectedCategory === "all" ? activeRouteIds : filteredPlaces.map((place) => place.id)}
                focusedPlaceId={focusedPlaceId}
                showAllConnections={showAllConnections}
                onMarkerClick={setFocusedPlaceId}
              />
            </div>

            <div className="glass-card p-5 md:p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-white/40">Route paths</p>
              <h3 className="mt-3 text-xl font-semibold md:text-2xl">Map network</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Switch between the full attraction network and ready travel paths.
              </p>

              <div className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                <button
                  onClick={() => selectRoute(allPlaceIds)}
                  className={`btn shrink-0 ${showAllConnections ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  All attractions
                </button>
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => selectRoute(route.placeIds)}
                    className={`btn shrink-0 ${
                      activeRouteIds.join("-") === route.placeIds.join("-")
                        ? "btn-active"
                        : "bg-white/5 text-white/80"
                    }`}
                  >
                    {route.title}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-3">
                {(showAllConnections ? PLACES : PLACES.filter((place) => activeRouteIds.includes(place.id))).map(
                  (place) => (
                    <button
                      key={place.id}
                      onClick={() => setFocusedPlaceId(place.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        focusedPlaceId === place.id
                          ? "border-white/30 bg-white/12"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                        {place.region}
                      </span>
                      <span className="mt-1 block font-semibold text-white">{place.name}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="glass-card p-5 md:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-white/40">Focused destination</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{selectedPlace.name}</h2>
                  </div>
                  <span className="rounded-full bg-[#f59e0b] px-4 py-2 text-sm font-medium text-slate-900">
                    {selectedPlace.duration}
                  </span>
                </div>

                <p className="text-white/70">{selectedPlace.desc}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">Region</p>
                    <p className="mt-2 text-base font-semibold text-white">{selectedPlace.region}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">Best time</p>
                    <p className="mt-2 text-base font-semibold text-white">{selectedPlace.bestTime}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm uppercase tracking-[0.24em] text-white/40">Travel tips</h3>
                  <ul className="mt-3 space-y-2 text-white/70">
                    {selectedPlace.facts.slice(0, 3).map((fact) => (
                      <li key={fact} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#0f766e]" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`/locations/${selectedPlace.id}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#134e4a]"
                >
                  Open full guide
                </a>
              </div>
            </div>

            <div className="glass-card p-5 md:p-6">
              <h3 className="text-xl font-semibold text-white">Route previews</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Tap a marker or a route and see the destination highlight immediately.
              </p>

              <div className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
                <button
                  onClick={() => selectRoute(allPlaceIds)}
                  className={`btn shrink-0 ${showAllConnections ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  All attractions
                </button>
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => selectRoute(route.placeIds)}
                    className={`btn shrink-0 ${
                      activeRouteIds.join("-") === route.placeIds.join("-")
                        ? "btn-active"
                        : "bg-white/5 text-white/80"
                    }`}
                  >
                    {route.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLACES.map((place, index) => (
              <motion.button
                key={place.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setFocusedPlaceId(place.id)}
                className={`glass-card p-4 text-left md:p-5 ${
                  focusedPlaceId === place.id ? "border-white/30 bg-white/10" : ""
                }`}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">{place.region}</p>
                <h3 className="mt-3 text-xl font-semibold">{place.name}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-white/65">{place.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {place.duration}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {place.bestTime}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
