"use client";

import { useDeferredValue, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import MapLoading from "@/components/MapLoading";
import { PLACES, ROUTES } from "@/lib/siteData";
import {
  TOURISM_FILTERS,
  getPlaceTourism,
  type TourismFilterId,
} from "@/lib/tourismData";

type ActiveFilter = TourismFilterId | "all";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function ExplorePage() {
  const allPlaceIds = PLACES.map((place) => place.id);
  const [activeRouteIds, setActiveRouteIds] = useState<string[]>(allPlaceIds);
  const [focusedPlaceId, setFocusedPlaceId] = useState<string>(PLACES[0].id);
  const [selectedFilter, setSelectedFilter] = useState<ActiveFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const showAllConnections = activeRouteIds.length === allPlaceIds.length;
  const hasCatalogFilter = selectedFilter !== "all" || searchQuery.trim().length > 0;

  const selectedPlace = PLACES.find((place) => place.id === focusedPlaceId) ?? PLACES[0];
  const selectedProfile = getPlaceTourism(selectedPlace);

  const filteredPlaces = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();

    return PLACES.filter((place) => {
      const profile = getPlaceTourism(place);
      const matchesFilter =
        selectedFilter === "all" || profile.filters.includes(selectedFilter);
      const matchesQuery =
        !query ||
        [place.name, place.region, place.desc, profile.categoryLabel, ...profile.highlights]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [deferredSearchQuery, selectedFilter]);

  const mapPlaceIds = hasCatalogFilter ? filteredPlaces.map((place) => place.id) : activeRouteIds;
  const visibleSidebarPlaces = hasCatalogFilter
    ? filteredPlaces
    : showAllConnections
      ? PLACES
      : PLACES.filter((place) => activeRouteIds.includes(place.id));

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
              <label className="mb-3 block">
                <span className="sr-only">Search map places</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search places on the map"
                  className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f]/85 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
                />
              </label>
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                <button
                  type="button"
                  aria-pressed={selectedFilter === "all"}
                  onClick={() => setSelectedFilter("all")}
                  className={`btn shrink-0 ${selectedFilter === "all" ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  All
                </button>
                {TOURISM_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={selectedFilter === filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`btn shrink-0 ${selectedFilter === filter.id ? "btn-active" : "bg-white/5 text-white/80"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <Map
                routePlaceIds={mapPlaceIds}
                focusedPlaceId={focusedPlaceId}
                showAllConnections={showAllConnections && !hasCatalogFilter}
                routeMode={showAllConnections && !hasCatalogFilter ? "network" : "route"}
                startPlaceId={mapPlaceIds[0]}
                destinationPlaceId={mapPlaceIds[mapPlaceIds.length - 1]}
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
                  type="button"
                  aria-pressed={showAllConnections}
                  onClick={() => selectRoute(allPlaceIds)}
                  className={`btn shrink-0 ${showAllConnections ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  All attractions
                </button>
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    aria-pressed={activeRouteIds.join("-") === route.placeIds.join("-")}
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
                {visibleSidebarPlaces.map((place) => {
                  const profile = getPlaceTourism(place);

                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => setFocusedPlaceId(place.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        focusedPlaceId === place.id
                          ? "border-white/30 bg-white/12"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                        {place.region} / {profile.categoryLabel}
                      </span>
                      <span className="mt-1 block font-semibold text-white">{place.name}</span>
                      <span className="mt-2 block text-xs text-white/45">
                        {profile.rating.toFixed(1)} rating / {profile.visitTime}
                      </span>
                    </button>
                  );
                })}
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
                    {selectedProfile.rating.toFixed(1)} rating
                  </span>
                </div>

                <p className="text-white/70">{selectedPlace.desc}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">Region</p>
                    <p className="mt-2 text-base font-semibold text-white">{selectedPlace.region}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">Visit time</p>
                    <p className="mt-2 text-base font-semibold text-white">{selectedProfile.visitTime}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm uppercase tracking-[0.24em] text-white/40">Travel tips</h3>
                  <ul className="mt-3 space-y-2 text-white/70">
                    {selectedProfile.touristTips.slice(0, 3).map((tip) => (
                      <li key={tip} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#0f766e]" />
                        <span>{tip}</span>
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
                  type="button"
                  aria-pressed={showAllConnections}
                  onClick={() => selectRoute(allPlaceIds)}
                  className={`btn shrink-0 ${showAllConnections ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  All attractions
                </button>
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    aria-pressed={activeRouteIds.join("-") === route.placeIds.join("-")}
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
            {filteredPlaces.map((place, index) => {
              const profile = getPlaceTourism(place);

              return (
              <motion.button
                key={place.id}
                type="button"
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
                    {profile.categoryLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {profile.rating.toFixed(1)} rating
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {profile.visitTime}
                  </span>
                </div>
              </motion.button>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
