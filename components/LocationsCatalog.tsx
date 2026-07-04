"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDeferredValue, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AnimatedTitle from "@/components/AnimatedTitle";
import MapLoading from "@/components/MapLoading";
import { useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import { LOCATION_FAVORITES_KEY, RECENT_PLACES_KEY } from "@/lib/appStorage";
import { PLACES, type TravelPlace } from "@/lib/siteData";
import { buildLocationRouteIds } from "@/lib/mapRouteLogic";
import {
  POPULAR_MANGYSTAU_ROUTES,
  TOURISM_FILTERS,
  getPlaceTourism,
  type TourismFilterId,
} from "@/lib/tourismData";

type ActiveFilter = TourismFilterId | "all";
type SortMode = "rating" | "popular" | "distance" | "alphabet";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "rating", label: "Rating" },
  { id: "popular", label: "Popularity" },
  { id: "distance", label: "Distance" },
  { id: "alphabet", label: "Alphabet" },
];

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function LocationsCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("rating");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mapRouteIds, setMapRouteIds] = useState<string[]>(() =>
    buildLocationRouteIds("bozzhyra")
  );
  const [focusedMapPlaceId, setFocusedMapPlaceId] = useState("bozzhyra");
  const [mapRouteLabel, setMapRouteLabel] = useState("Aktau to Bozzhyra");
  const favorites = useStoredIds(LOCATION_FAVORITES_KEY);
  const recent = useStoredIds(RECENT_PLACES_KEY);

  const placeCards = useMemo(
    () =>
      PLACES.map((place) => {
        const profile = getPlaceTourism(place);
        const searchIndex = [
          place.name,
          place.region,
          place.desc,
          place.bestTime,
          profile.categoryLabel,
          profile.visitTime,
          `${profile.distanceFromAktauKm} km`,
          ...profile.highlights,
          ...profile.touristTips,
        ]
          .join(" ")
          .toLowerCase();

        return { place, profile, searchIndex };
      }),
    []
  );

  const sortedPlaces = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const favoriteIds = new Set(favorites);

    return placeCards
      .filter(({ place, profile, searchIndex }) => {
        const matchesFilter =
          activeFilter === "all" || profile.filters.includes(activeFilter);
        const matchesQuery = !query || searchIndex.includes(query);
        const matchesFavorite = !showFavoritesOnly || favoriteIds.has(place.id);

        return matchesFilter && matchesQuery && matchesFavorite;
      })
      .sort((first, second) => {
        const byName = first.place.name.localeCompare(second.place.name);

        if (sortMode === "rating") {
          return second.profile.rating - first.profile.rating || byName;
        }

        if (sortMode === "popular") {
          return second.profile.popularityScore - first.profile.popularityScore || byName;
        }

        if (sortMode === "distance") {
          return first.profile.distanceFromAktauKm - second.profile.distanceFromAktauKm || byName;
        }

        return byName;
      });
  }, [
    activeFilter,
    deferredSearchQuery,
    favorites,
    placeCards,
    showFavoritesOnly,
    sortMode,
  ]);

  const favoritePlaces = useMemo(
    () => getPlacesFromIds(favorites).slice(0, 6),
    [favorites]
  );

  const recentPlaces = useMemo(() => getPlacesFromIds(recent).slice(0, 6), [recent]);

  const toggleFavorite = (placeId: string) => {
    const next = favorites.includes(placeId)
      ? favorites.filter((id) => id !== placeId)
      : [placeId, ...favorites];

    writeStoredIds(LOCATION_FAVORITES_KEY, next);
  };

  const showPlaceRoute = (placeId: string) => {
    const routeIds = buildLocationRouteIds(placeId);
    const place = PLACES.find((item) => item.id === placeId);

    setMapRouteIds(routeIds);
    setFocusedMapPlaceId(placeId);
    setMapRouteLabel(place ? `Aktau to ${place.name}` : "Route mode");
  };

  const showPopularRoute = (routeId: string) => {
    const route = POPULAR_MANGYSTAU_ROUTES.find((item) => item.id === routeId);

    if (!route) {
      return;
    }

    setMapRouteIds(route.placeIds);
    setFocusedMapPlaceId(route.placeIds[route.placeIds.length - 1] ?? route.placeIds[0]);
    setMapRouteLabel(route.title);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-8 md:space-y-10"
    >
      <div className="space-y-3">
        <AnimatedTitle text="Destinations" className="text-3xl md:text-4xl" />
        <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
          Explore Mangystau travel cards with route-ready details, ratings, visit timing,
          reviews and practical tips, while keeping the wider Kazakhstan catalog close.
        </p>
      </div>

      <div className="glass-card space-y-5 p-4 md:p-5">
        <label className="block">
          <span className="sr-only">Search places</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search places, categories or travel tips"
            className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f]/85 px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30 md:text-base"
          />
        </label>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              aria-pressed={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
              className={`btn shrink-0 ${activeFilter === "all" ? "btn-active" : "bg-white/5 text-white/80"}`}
            >
              All
            </button>
            {TOURISM_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`btn shrink-0 ${activeFilter === filter.id ? "btn-active" : "bg-white/5 text-white/80"}`}
              >
                {filter.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={showFavoritesOnly}
              onClick={() => setShowFavoritesOnly((value) => !value)}
              className={`btn shrink-0 ${showFavoritesOnly ? "btn-active" : "bg-white/5 text-white/80"}`}
            >
              Favorites
            </button>
          </div>

          <label className="block min-w-48">
            <span className="sr-only">Sort places</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f]/85 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {favoritePlaces.length > 0 ? (
        <SavedStrip title="Favorites" places={favoritePlaces} />
      ) : null}

      {recentPlaces.length > 0 ? (
        <SavedStrip title="Recently viewed" places={recentPlaces} />
      ) : null}

      <div className="glass-card space-y-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/40">Route mode</p>
            <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">{mapRouteLabel}</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {POPULAR_MANGYSTAU_ROUTES.map((route) => (
              <button
                key={route.id}
                type="button"
                aria-pressed={mapRouteIds.join("-") === route.placeIds.join("-")}
                onClick={() => showPopularRoute(route.id)}
                className={`btn shrink-0 ${
                  mapRouteIds.join("-") === route.placeIds.join("-")
                    ? "btn-active"
                    : "bg-white/5 text-white/80"
                }`}
              >
                {route.title}
              </button>
            ))}
          </div>
        </div>

        <Map
          routeMode="route"
          routePlaceIds={mapRouteIds}
          focusedPlaceId={focusedMapPlaceId}
          startPlaceId={mapRouteIds[0]}
          destinationPlaceId={mapRouteIds[mapRouteIds.length - 1]}
          onMarkerClick={showPlaceRoute}
        />
      </div>

      <div
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        aria-live="polite"
        aria-busy={searchQuery !== deferredSearchQuery}
      >
        {sortedPlaces.map(({ place, profile }, index) => {
          const isFavorite = favorites.includes(place.id);

          return (
            <motion.article
              key={place.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group overflow-hidden rounded-[18px] border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10 md:rounded-[22px]"
              aria-labelledby={`place-${place.id}`}
            >
              {profile.photo ? (
                <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-white/5">
                  <Image
                    src={profile.photo}
                    alt={`${place.name} photo`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                </div>
              ) : null}

              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/40">
                      {place.region}
                    </p>
                    <h2
                      id={`place-${place.id}`}
                      className="mt-3 text-lg font-semibold text-white md:text-xl"
                    >
                      {place.name}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {profile.categoryLabel}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-white/70">{place.desc}</p>

                <div className="mt-5 grid gap-2 text-xs text-white/60 sm:grid-cols-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    Rating {profile.rating.toFixed(1)} / {profile.reviewCount} reviews
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    {profile.visitTime}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    {profile.distanceFromAktauKm} km from Aktau
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    Popularity {profile.popularityScore}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.filters.slice(0, 3).map((filterId) => {
                    const filter = TOURISM_FILTERS.find((item) => item.id === filterId);

                    return (
                      <span
                        key={filterId}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50"
                      >
                        {filter?.label ?? filterId}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Link
                    href={`/locations/${place.id}`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 sm:w-auto"
                  >
                    View guide
                    <span aria-hidden="true" className="ml-2">
                      {"\u2192"}
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-pressed={isFavorite}
                    aria-label={`${isFavorite ? "Remove" : "Save"} ${place.name}`}
                    onClick={() => toggleFavorite(place.id)}
                    className={`inline-flex w-full items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm transition sm:w-auto ${
                      isFavorite
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {isFavorite ? "Saved" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => showPlaceRoute(place.id)}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/15 sm:w-auto"
                  >
                    Show route
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {sortedPlaces.length === 0 ? (
        <div className="glass-card p-6 text-sm text-white/55">
          No places match this search yet. Try another category or a shorter query.
        </div>
      ) : null}
    </motion.section>
  );
}

function SavedStrip({ title, places }: { title: string; places: TravelPlace[] }) {
  return (
    <section className="glass-card space-y-3 p-4 md:p-5" aria-label={title}>
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">{title}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {places.map((place) => (
          <Link
            key={place.id}
            href={`/locations/${place.id}`}
            className="btn shrink-0 bg-white/5 text-white/80"
          >
            {place.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function getPlacesFromIds(ids: string[]) {
  return ids
    .map((id) => PLACES.find((place) => place.id === id))
    .filter((place): place is TravelPlace => Boolean(place));
}
