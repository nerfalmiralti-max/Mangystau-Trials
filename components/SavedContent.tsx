"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { readStoredIds, useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import { useToast } from "@/components/ToastProvider";
import {
  GUIDE_FAVORITES_KEY,
  LOCATION_FAVORITES_KEY,
  SAVED_HOTELS_KEY,
  SAVED_ROUTES_KEY,
} from "@/lib/appStorage";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsRouteUrl,
  formatDistanceKm,
  getHaversineDistanceKm,
} from "@/lib/geo";
import { guideDestinations, type GuideDestination } from "@/lib/guideData";
import {
  buildHotelMapsSearchUrl,
  isPreviewHotel,
  mangystauHotels,
  type HotelOption,
} from "@/lib/hotelsData";
import { PLACES, type TravelPlace } from "@/lib/siteData";
import {
  parseGeneratedRouteId,
  type GeneratedRoutePlan,
} from "@/lib/generatedRoute";
import { getPlaceTourism } from "@/lib/tourismData";
import { parsePlannerRouteId, type PlannerPlan } from "@/lib/tripPlannerData";
import { useUserLocation } from "@/hooks/useUserLocation";

type SavedTab = "places" | "hotels" | "routes";

type SavedRouteEntry =
  | { kind: "generated"; route: GeneratedRoutePlan; storageId: string }
  | { kind: "legacy"; route: PlannerPlan; storageId: string };

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

const AKTAU_CENTER: [number, number] = [43.653, 51.197];

export default function SavedContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SavedTab>("places");
  const guideFavoriteIds = useStoredIds(GUIDE_FAVORITES_KEY);
  const locationFavoriteIds = useStoredIds(LOCATION_FAVORITES_KEY);
  const savedHotelIds = useStoredIds(SAVED_HOTELS_KEY);
  const savedRouteIds = useStoredIds(SAVED_ROUTES_KEY);
  const userLocation = useUserLocation();
  const [status, setStatus] = useState("");
  const pendingRemovalsRef = useRef(new Set<string>());

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
        .map((id): SavedRouteEntry | null => {
          const generatedRoute = parseGeneratedRouteId(id);
          if (generatedRoute) return { kind: "generated", route: generatedRoute, storageId: id };

          const legacyRoute = parsePlannerRouteId(id);
          return legacyRoute ? { kind: "legacy", route: legacyRoute, storageId: id } : null;
        })
        .filter((route): route is SavedRouteEntry => Boolean(route)),
    [savedRouteIds]
  );

  useEffect(() => {
    const validRouteIds = savedRouteIds.filter(
      (id) => Boolean(parseGeneratedRouteId(id) ?? parsePlannerRouteId(id))
    );

    if (validRouteIds.length !== savedRouteIds.length) {
      try {
        writeStoredIds(SAVED_ROUTES_KEY, validRouteIds);
      } catch {
        // Invalid legacy entries can remain until browser storage becomes writable.
      }
    }
  }, [savedRouteIds]);

  const removeSavedRoute = async (routeId: string) => {
    const pendingKey = `route:${routeId}`;
    if (pendingRemovalsRef.current.has(pendingKey)) return;
    pendingRemovalsRef.current.add(pendingKey);
    try {
      writeStoredIds(
        SAVED_ROUTES_KEY,
        readStoredIds(SAVED_ROUTES_KEY).filter((id) => id !== routeId)
      );
    } catch {
      pendingRemovalsRef.current.delete(pendingKey);
      setStatus("Saved routes could not be updated on this device.");
      return;
    }
    setStatus("Route removed from this device.");

    try {
      const response = await fetch("/api/saved-routes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ planId: routeId }),
      });

      if (response.ok) {
        setStatus("Route removed from your profile and this device.");
        showToast({ kind: "success", title: "Route removed" });
      } else if (response.status === 401) {
        setStatus("Route removed from this device. A profile copy was not changed because you are logged out.");
        showToast({ kind: "success", title: "Route removed from this device" });
      } else {
        restoreStoredId(SAVED_ROUTES_KEY, routeId);
        setStatus("The profile copy could not be removed, so the route was restored. Try again.");
      }
    } catch {
      restoreStoredId(SAVED_ROUTES_KEY, routeId);
      setStatus("The network is offline, so the route was restored. Try again when you are connected.");
    } finally {
      pendingRemovalsRef.current.delete(pendingKey);
    }
  };

  const removeSavedPlace = async (placeId: string) => {
    const pendingKey = `place:${placeId}`;
    if (pendingRemovalsRef.current.has(pendingKey)) return;
    pendingRemovalsRef.current.add(pendingKey);
    const currentGuideFavoriteIds = readStoredIds(GUIDE_FAVORITES_KEY);
    const currentLocationFavoriteIds = readStoredIds(LOCATION_FAVORITES_KEY);
    const wasGuideFavorite = currentGuideFavoriteIds.includes(placeId);
    const wasLocationFavorite = currentLocationFavoriteIds.includes(placeId);
    try {
      writeStoredIds(
        GUIDE_FAVORITES_KEY,
        currentGuideFavoriteIds.filter((id) => id !== placeId)
      );
      writeStoredIds(
        LOCATION_FAVORITES_KEY,
        currentLocationFavoriteIds.filter((id) => id !== placeId)
      );
    } catch {
      if (wasGuideFavorite) restoreStoredId(GUIDE_FAVORITES_KEY, placeId);
      if (wasLocationFavorite) restoreStoredId(LOCATION_FAVORITES_KEY, placeId);
      pendingRemovalsRef.current.delete(pendingKey);
      setStatus("Saved places could not be updated on this device.");
      return;
    }
    setStatus("Place removed from this device.");

    try {
      const response = await fetch("/api/saved-locations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ locationId: placeId }),
      });

      if (response.ok) {
        setStatus("Place removed from your profile and this device.");
        showToast({ kind: "success", title: "Favorite removed" });
      } else if (response.status === 401) {
        setStatus("Place removed from this device. A profile copy was not changed because you are logged out.");
        showToast({ kind: "success", title: "Favorite removed from this device" });
      } else {
        if (wasGuideFavorite) restoreStoredId(GUIDE_FAVORITES_KEY, placeId);
        if (wasLocationFavorite) restoreStoredId(LOCATION_FAVORITES_KEY, placeId);
        setStatus("The profile copy could not be removed, so the place was restored. Try again.");
      }
    } catch {
      if (wasGuideFavorite) restoreStoredId(GUIDE_FAVORITES_KEY, placeId);
      if (wasLocationFavorite) restoreStoredId(LOCATION_FAVORITES_KEY, placeId);
      setStatus("The network is offline, so the place was restored. Try again when you are connected.");
    } finally {
      pendingRemovalsRef.current.delete(pendingKey);
    }
  };

  const removeSavedHotel = (hotelId: string) => {
    try {
      writeStoredIds(
        SAVED_HOTELS_KEY,
        readStoredIds(SAVED_HOTELS_KEY).filter((id) => id !== hotelId)
      );
    } catch {
      setStatus("Saved hotels could not be updated on this device.");
      return;
    }
    setStatus("Hotel removed from saved trips");
    showToast({ kind: "success", title: "Hotel removed" });
  };

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
              <SavedPlaceCard
                key={place.id}
                place={place}
                onRemove={() => void removeSavedPlace(place.id)}
              />
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
                onRemove={() => removeSavedHotel(hotel.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No saved hotels" href="/chat?view=hotels" action="Find Hotels" />
        )
      ) : null}

      {activeTab === "routes" ? (
        savedRoutes.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {savedRoutes.map((route) => (
              <SavedRouteCard
                key={route.storageId}
                entry={route}
                onRemove={() => void removeSavedRoute(route.storageId)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No saved routes" href="/routes" action="Create a route" />
        )
      ) : null}
    </div>
  );
}

function restoreStoredId(storageKey: string, id: string) {
  try {
    const current = readStoredIds(storageKey);
    if (!current.includes(id)) writeStoredIds(storageKey, [id, ...current]);
  } catch {
    // The visible status already explains the failed sync; avoid a render crash.
  }
}

function SavedPlaceCard({ place, onRemove }: { place: SavedPlaceCard; onRemove: () => void }) {
  return (
    <article className="grid grid-cols-[108px_1fr] overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
      <div className="relative min-h-32 bg-white/5">
        <Image src={place.image} alt={`${place.name} photo`} fill sizes="108px" className="object-cover" />
      </div>
      <div className="min-w-0 p-3">
        <h2 className="truncate text-base font-semibold text-white">{place.name}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/65">
          <QuickPill value={`Editorial ${place.rating.toFixed(1)}`} />
          <QuickPill value={place.distance} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={place.href} className="btn chat-button min-h-10 justify-center py-2">
            Open
          </Link>
          <button
            type="button"
            onClick={onRemove}
            className="btn min-h-10 justify-center py-2 text-white/65"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function SavedHotelCard({
  hotel,
  userCoordinates,
  onStatus,
  onRemove,
}: {
  hotel: HotelOption;
  userCoordinates: [number, number] | null;
  onStatus: (message: string) => void;
  onRemove: () => void;
}) {
  const routeUrl = buildGoogleMapsDirectionsUrl(hotel.coordinates, userCoordinates ?? undefined);
  const mapsUrl = buildHotelMapsSearchUrl(hotel);
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
          <QuickPill
            value={isPreviewHotel(hotel) ? "Preview listing" : `Guide score ${hotel.rating.toFixed(1)}`}
          />
          <QuickPill value={hotel.priceRange} />
          <QuickPill value={distance} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={routeUrl} target="_blank" rel="noreferrer" className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Get Route
          </a>
          <button type="button" onClick={copyAddress} className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Copy
          </button>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Maps
          </a>
          <button
            type="button"
            onClick={onRemove}
            className="btn min-h-9 justify-center px-2 py-2 text-xs text-white/65"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function SavedRouteCard({
  entry,
  onRemove,
}: {
  entry: SavedRouteEntry;
  onRemove: () => void;
}) {
  const generatedStops =
    entry.kind === "generated"
      ? entry.route.placeIds
          .map((id) => PLACES.find((place) => place.id === id))
          .filter((place): place is TravelPlace => Boolean(place))
      : [];
  const route = entry.route;
  const title = route.title;
  const meta =
    entry.kind === "generated"
      ? `${entry.route.days} days / ${entry.route.distanceKm} km`
      : entry.route.meta;
  const stopNames =
    entry.kind === "generated"
      ? generatedStops.map((place) => place.name)
      : entry.route.stops.map((stop) => stop.name);
  const cover =
    entry.kind === "generated"
      ? getPlaceTourism(generatedStops.at(-1) ?? PLACES[0]).photo ?? "/locations/photos/bozzhyra.jpg"
      : entry.route.stops[0]?.image ?? "/locations/photos/bozzhyra.jpg";
  const destinationCoordinates =
    entry.kind === "generated"
      ? generatedStops.at(-1)?.coordinates
      : entry.route.stops.at(-1)?.coordinates;
  const storedRouteCoordinates =
    entry.kind === "generated"
      ? generatedStops.map((stop) => stop.coordinates)
      : entry.route.stops.map((stop) => stop.coordinates);
  const routeCoordinates =
    entry.kind === "generated"
      ? storedRouteCoordinates.length > 0
        ? [...storedRouteCoordinates, storedRouteCoordinates[0]]
        : []
      : [AKTAU_CENTER, ...storedRouteCoordinates, AKTAU_CENTER];
  const openHref =
    entry.kind === "generated"
      ? `/routes?plan=${encodeURIComponent(entry.route.id)}`
      : `/chat?view=planner&plan=${encodeURIComponent(entry.storageId)}`;

  return (
    <article className="grid grid-cols-[108px_1fr] overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
      <div className="relative min-h-36 bg-white/5">
        <Image src={cover} alt={`${title} photo`} fill sizes="108px" className="object-cover" />
      </div>
      <div className="min-w-0 p-3">
        <h2 className="truncate text-base font-semibold text-white">{title}</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/65">
          <QuickPill value={meta} />
          <QuickPill value={`${stopNames.length} stops`} />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {stopNames.map((stop) => (
            <span key={stop} className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
              {stop}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Link href={openHref} className="btn chat-button justify-center px-2 py-2 text-xs">
            Open
          </Link>
          {destinationCoordinates ? (
            <a
              href={buildGoogleMapsRouteUrl(routeCoordinates)}
              target="_blank"
              rel="noreferrer"
              className="btn justify-center px-2 py-2 text-xs"
            >
              Route
            </a>
          ) : null}
          <button type="button" onClick={onRemove} className="btn justify-center px-2 py-2 text-xs text-white/65">
            Remove
          </button>
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
    href: PLACES.some((place) => place.id === destination.id)
      ? `/locations/${destination.id}`
      : `/chat?place=${encodeURIComponent(destination.id)}`,
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
