"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStoredIds } from "@/components/useStoredIds";
import {
  GUIDE_FAVORITES_KEY,
  LOCATION_FAVORITES_KEY,
  SAVED_HOTELS_KEY,
  SAVED_ROUTES_KEY,
} from "@/lib/appStorage";
import { getHaversineDistanceKm, formatDistanceKm, buildGoogleMapsDirectionsUrl } from "@/lib/geo";
import { guideDestinations, type GuideDestination } from "@/lib/guideData";
import { mangystauHotels, type HotelOption } from "@/lib/hotelsData";
import { PLACES, type TravelPlace } from "@/lib/siteData";
import { getPlaceTourism } from "@/lib/tourismData";
import { parsePlannerRouteId, type PlannerPlan } from "@/lib/tripPlannerData";
import { useUserLocation } from "@/hooks/useUserLocation";

type SavedTab = "places" | "hotels" | "routes";

type SavedPlaceCard = {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
  href: string;
};

const tabs: { id: SavedTab; label: string }[] = [
  { id: "places", label: "Saved Places" },
  { id: "hotels", label: "Saved Hotels" },
  { id: "routes", label: "Saved Routes" },
];

export default function SavedContent() {
  const [activeTab, setActiveTab] = useState<SavedTab>("places");
  const guideFavoriteIds = useStoredIds(GUIDE_FAVORITES_KEY);
  const locationFavoriteIds = useStoredIds(LOCATION_FAVORITES_KEY);
  const savedHotelIds = useStoredIds(SAVED_HOTELS_KEY);
  const savedRouteIds = useStoredIds(SAVED_ROUTES_KEY);
  const userLocation = useUserLocation();
  const [status, setStatus] = useState("");

  const savedPlaces = useMemo(
    () => buildSavedPlaces(guideFavoriteIds, locationFavoriteIds, userLocation.coordinates),
    [guideFavoriteIds, locationFavoriteIds, userLocation.coordinates]
  );

  const savedHotels = useMemo(
    () =>
      savedHotelIds
        .map((id) => mangystauHotels.find((hotel) => hotel.id === id))
        .filter((hotel): hotel is HotelOption => Boolean(hotel)),
    [savedHotelIds]
  );

  const savedRoutes = useMemo(
    () =>
      savedRouteIds
        .map((id) => parsePlannerRouteId(id))
        .filter((route): route is PlannerPlan => Boolean(route)),
    [savedRouteIds]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-[20px] border border-white/10 bg-white/5 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-10 rounded-[16px] px-2 text-xs font-semibold transition ${
              activeTab === tab.id ? "bg-white text-black" : "text-white/62 hover:bg-white/8 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {status ? (
        <p aria-live="polite" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/66">
          {status}
        </p>
      ) : null}

      {activeTab === "places" ? (
        savedPlaces.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {savedPlaces.map((place) => (
              <SavedPlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState title="No saved places" href="/chat" action="Explore Guide" />
        )
      ) : null}

      {activeTab === "hotels" ? (
        savedHotels.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {savedHotels.map((hotel) => (
              <SavedHotelCard
                key={hotel.id}
                hotel={hotel}
                userCoordinates={userLocation.coordinates}
                onStatus={setStatus}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No saved hotels" href="/chat" action="Find Hotels" />
        )
      ) : null}

      {activeTab === "routes" ? (
        savedRoutes.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {savedRoutes.map((route) => (
              <SavedRouteCard key={route.id} route={route} />
            ))}
          </div>
        ) : (
          <EmptyState title="No saved routes" href="/chat" action="Open Planner" />
        )
      ) : null}
    </div>
  );
}

function SavedPlaceCard({ place }: { place: SavedPlaceCard }) {
  return (
    <article className="grid grid-cols-[108px_1fr] overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
      <div className="relative min-h-32 bg-white/5">
        <Image src={place.image} alt={`${place.name} photo`} fill sizes="108px" className="object-cover" />
      </div>
      <div className="min-w-0 p-3">
        <h2 className="truncate text-base font-semibold text-white">{place.name}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/65">
          <QuickPill value={`\u2B50 ${place.rating.toFixed(1)}`} />
          <QuickPill value={place.distance} />
        </div>
        <Link href={place.href} className="btn chat-button mt-4 min-h-10 w-full justify-center py-2">
          Open
        </Link>
      </div>
    </article>
  );
}

function SavedHotelCard({
  hotel,
  userCoordinates,
  onStatus,
}: {
  hotel: HotelOption;
  userCoordinates: [number, number] | null;
  onStatus: (message: string) => void;
}) {
  const routeUrl = buildGoogleMapsDirectionsUrl(hotel.coordinates, userCoordinates ?? undefined);
  const mapsUrl = buildGoogleMapsDirectionsUrl(hotel.coordinates);
  const distance = userCoordinates
    ? formatDistanceKm(getHaversineDistanceKm(userCoordinates, hotel.coordinates))
    : hotel.cityArea;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${hotel.name} - ${hotel.address}`);
      onStatus("Address copied");
    } catch {
      onStatus("Copy unavailable");
    }
  };

  return (
    <article className="grid grid-cols-[108px_1fr] overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
      <div className="relative min-h-36 bg-white/5">
        <Image src={hotel.image} alt={`${hotel.name} photo`} fill sizes="108px" className="object-cover" />
      </div>
      <div className="min-w-0 p-3">
        <h2 className="truncate text-base font-semibold text-white">{hotel.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/65">
          <QuickPill value={`\u2B50 ${hotel.rating.toFixed(1)}`} />
          <QuickPill value={hotel.priceRange} />
          <QuickPill value={distance} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <a href={routeUrl} target="_blank" rel="noreferrer" className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Get Route
          </a>
          <button type="button" onClick={copyAddress} className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Copy
          </button>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Maps
          </a>
        </div>
      </div>
    </article>
  );
}

function SavedRouteCard({ route }: { route: PlannerPlan }) {
  const cover = route.stops[0]?.image ?? "/locations/photos/bozzhyra.jpg";
  const destination = route.stops[route.stops.length - 1];

  return (
    <article className="grid grid-cols-[108px_1fr] overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
      <div className="relative min-h-36 bg-white/5">
        <Image src={cover} alt={`${route.title} photo`} fill sizes="108px" className="object-cover" />
      </div>
      <div className="min-w-0 p-3">
        <h2 className="truncate text-base font-semibold text-white">{route.title}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/65">
          <QuickPill value={route.meta} />
          <QuickPill value={`${route.stops.length} stops`} />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {route.stops.map((stop) => (
            <span key={stop.id} className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
              {stop.name}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href="/chat" className="btn chat-button justify-center py-2 text-xs">
            Open
          </Link>
          {destination ? (
            <a
              href={buildGoogleMapsDirectionsUrl(destination.coordinates)}
              target="_blank"
              rel="noreferrer"
              className="btn justify-center py-2 text-xs"
            >
              Route
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EmptyState({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <div className="glass-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-white/66">{title}</p>
      <Link href={href} className="btn chat-button justify-center">
        {action}
      </Link>
    </div>
  );
}

function QuickPill({ value }: { value: string }) {
  return (
    <span className="min-w-0 truncate rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-center">
      {value}
    </span>
  );
}

function buildSavedPlaces(
  guideFavoriteIds: string[],
  locationFavoriteIds: string[],
  userCoordinates: [number, number] | null
) {
  const savedPlaces: SavedPlaceCard[] = [];
  const seen = new Set<string>();

  guideFavoriteIds.forEach((id) => {
    const destination = guideDestinations.find((item) => item.id === id);
    if (!destination || seen.has(destination.id)) {
      return;
    }

    savedPlaces.push(buildGuidePlaceCard(destination, userCoordinates));
    seen.add(destination.id);
  });

  locationFavoriteIds.forEach((id) => {
    const place = PLACES.find((item) => item.id === id);
    if (!place || seen.has(place.id)) {
      return;
    }

    savedPlaces.push(buildLocationPlaceCard(place, userCoordinates));
    seen.add(place.id);
  });

  return savedPlaces;
}

function buildGuidePlaceCard(destination: GuideDestination, userCoordinates: [number, number] | null): SavedPlaceCard {
  const distance = userCoordinates
    ? formatDistanceKm(getHaversineDistanceKm(userCoordinates, destination.coordinates))
    : `${destination.distanceFromAktauKm} km`;

  return {
    id: destination.id,
    name: destination.name,
    image: destination.image,
    rating: destination.rating,
    distance,
    href: `/locations/${destination.id}`,
  };
}

function buildLocationPlaceCard(place: TravelPlace, userCoordinates: [number, number] | null): SavedPlaceCard {
  const profile = getPlaceTourism(place);
  const distance = userCoordinates
    ? formatDistanceKm(getHaversineDistanceKm(userCoordinates, place.coordinates))
    : `${profile.distanceFromAktauKm} km`;

  return {
    id: place.id,
    name: place.name,
    image: profile.photo ?? "/locations/photos/bozzhyra.jpg",
    rating: profile.rating,
    distance,
    href: `/locations/${place.id}`,
  };
}
