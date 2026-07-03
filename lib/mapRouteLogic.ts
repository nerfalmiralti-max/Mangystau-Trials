import { PLACES, getPlacesByIds, type TravelPlace } from "@/lib/siteData";
import { POPULAR_MANGYSTAU_ROUTES, getPlaceTourism } from "@/lib/tourismData";
import type { MapSticker } from "@/lib/travelTypes";

export type MapRouteMode = "network" | "route";

export type MapRouteState = {
  activePlaces: TravelPlace[];
  routePlaces: TravelPlace[];
  activePlaceIds: Set<string>;
  startPlace?: TravelPlace;
  destinationPlace?: TravelPlace;
  stickers: MapSticker[];
};

export function buildLocationRouteIds(destinationPlaceId: string) {
  const knownRoute = POPULAR_MANGYSTAU_ROUTES.find((route) =>
    route.placeIds.includes(destinationPlaceId)
  );

  if (knownRoute) {
    const destinationIndex = knownRoute.placeIds.indexOf(destinationPlaceId);
    return knownRoute.placeIds.slice(0, Math.max(destinationIndex + 1, 2));
  }

  if (destinationPlaceId === "aktau") {
    return ["aktau"];
  }

  return ["aktau", destinationPlaceId];
}

export function buildMapRouteState({
  routePlaceIds,
  focusedPlaceId,
  routeMode,
  startPlaceId,
  destinationPlaceId,
}: {
  routePlaceIds: string[];
  focusedPlaceId?: string;
  routeMode: MapRouteMode;
  startPlaceId?: string;
  destinationPlaceId?: string;
}): MapRouteState {
  const routePlaces = getPlacesByIds(routePlaceIds);
  const activePlaces = routePlaces.length > 0 ? routePlaces : PLACES;
  const activePlaceIds = new Set(routePlaceIds);
  const startPlace =
    PLACES.find((place) => place.id === startPlaceId) ??
    routePlaces[0] ??
    undefined;
  const destinationPlace =
    PLACES.find((place) => place.id === destinationPlaceId) ??
    routePlaces[routePlaces.length - 1] ??
    undefined;

  const stickers = PLACES.map((place) => {
    const isStart = routeMode === "route" && place.id === startPlace?.id;
    const isDestination = routeMode === "route" && place.id === destinationPlace?.id;
    const profile = getPlaceTourism(place);
    const isActive =
      routeMode === "network" ||
      routePlaceIds.length === 0 ||
      activePlaceIds.has(place.id) ||
      focusedPlaceId === place.id;

    return {
      id: `sticker-${place.id}`,
      placeId: place.id,
      name: place.name,
      coordinates: place.coordinates,
      category: profile.categoryLabel,
      icon: getMapStickerIcon(place),
      label: isStart ? "Start" : isDestination ? "Destination" : profile.categoryLabel,
      description: buildStickerDescription(place),
      role: isStart ? "start" : isDestination ? "destination" : "place",
      isActive,
    } satisfies MapSticker;
  });

  return {
    activePlaces,
    routePlaces,
    activePlaceIds,
    startPlace,
    destinationPlace,
    stickers,
  };
}

export function getMapStickerIcon(place: TravelPlace) {
  if (place.category === "culture") return "🏛️";
  if (place.category === "city") return "◎";
  if (place.id === "caspian-sea") return "≈";
  if (place.category === "desert") return "◇";
  return "✦";
}

function buildStickerDescription(place: TravelPlace) {
  const description = place.desc.replace(/[.!?]+$/, "");
  return description.length > 52 ? `${description.slice(0, 49)}...` : description;
}
