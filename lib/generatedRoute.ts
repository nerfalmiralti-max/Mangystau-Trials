import { getGuideDestinationById } from "@/lib/guideData";
import { getHaversineDistanceKm } from "@/lib/geo";
import { PLACES, getPlacesByIds, type TravelPlace } from "@/lib/siteData";

export const routeInterests = [
  { id: "nature", label: "Wild landscapes" },
  { id: "photography", label: "Photography" },
  { id: "culture", label: "Sacred places" },
  { id: "family", label: "Family-friendly" },
  { id: "desert", label: "Expedition" },
] as const;

export const routePaces = ["Relaxed", "Balanced", "Active"] as const;

export const routeStartOptions = [
  { id: "aktau", label: "Aktau" },
  { id: "airport", label: "Aktau airport" },
] as const;

export const routeTransportOptions = [
  { id: "driver", label: "Driver-guide" },
  { id: "suv", label: "Own 4x4" },
  { id: "sedan", label: "Sedan" },
] as const;

export const routeGroupOptions = [
  { id: "solo", label: "Solo" },
  { id: "friends", label: "Friends" },
  { id: "family", label: "Family" },
] as const;

export const routeBudgetOptions = [
  { id: "smart", label: "Smart" },
  { id: "standard", label: "Comfort" },
  { id: "premium", label: "Private" },
] as const;

export type RouteInterest = (typeof routeInterests)[number]["id"];
export type RoutePace = (typeof routePaces)[number];
export type RouteStart = (typeof routeStartOptions)[number]["id"];
export type RouteTransport = (typeof routeTransportOptions)[number]["id"];
export type RouteGroup = (typeof routeGroupOptions)[number]["id"];
export type RouteBudget = (typeof routeBudgetOptions)[number]["id"];

export type RoutePreferences = {
  days: number;
  start: RouteStart;
  destinationId: string;
  interest: RouteInterest;
  pace: RoutePace;
  transport: RouteTransport;
  group: RouteGroup;
  budget: RouteBudget;
};

export type GeneratedRoutePlan = {
  id: string;
  title: string;
  eyebrow: string;
  days: number;
  distanceKm: number;
  driveTime: string;
  difficulty: string;
  budget: string;
  transport: string;
  placeIds: string[];
  description: string;
  reasons: string[];
  dayPlan: string[];
  equipment: string[];
  warnings: string[];
  overnight: string[];
  alternative: string;
  preferences: RoutePreferences;
};

export const defaultRoutePreferences: RoutePreferences = {
  days: 3,
  start: "aktau",
  destinationId: "bozzhyra",
  interest: "photography",
  pace: "Balanced",
  transport: "driver",
  group: "friends",
  budget: "standard",
};

const generatedRoutePrefix = "mt-route:v1";
const sedanDestinationIds = new Set(["caspian-sea", "torysh"]);

export function isRouteDestination(destinationId: string) {
  return PLACES.some(
    (place) => place.id === destinationId && place.region === "Mangystau" && place.id !== "aktau"
  );
}

export function isRouteDestinationCompatible(destinationId: string, transport: RouteTransport) {
  return isRouteDestination(destinationId) &&
    (transport !== "sedan" || sedanDestinationIds.has(destinationId));
}

export function buildGeneratedRoute(input: RoutePreferences): GeneratedRoutePlan {
  const preferences = normalizePreferences(input);
  const destination =
    PLACES.find((place) => place.id === preferences.destinationId && place.region === "Mangystau") ??
    PLACES.find((place) => place.id === "bozzhyra") ??
    PLACES[0];
  const destinationGuide = getGuideDestinationById(destination.id);
  const placeIds = buildRoutePlaceIds(destination, preferences);
  const routePlaces = getPlacesByIds(placeIds);
  const distanceKm = estimateRoadDistance(routePlaces, preferences.start);
  const startLabel = getOptionLabel(routeStartOptions, preferences.start);
  const transportLabel = getOptionLabel(routeTransportOptions, preferences.transport);
  const interestLabel = getOptionLabel(routeInterests, preferences.interest);
  const difficulty = destinationGuide?.difficulty ?? inferDifficulty(destination, preferences.transport);
  const alternativeDestination = chooseAlternative(
    destination.id,
    preferences.group,
    preferences.transport
  );

  return {
    id: serializeGeneratedRoute(preferences),
    title: `${destination.name} expedition`,
    eyebrow: `${preferences.days} days from ${startLabel} / ${interestLabel}`,
    days: preferences.days,
    distanceKm,
    driveTime: formatDriveTime(distanceKm, preferences.days),
    difficulty,
    budget: estimateBudget(preferences),
    transport: transportLabel,
    placeIds,
    description: buildDescription(destination, preferences, routePlaces.length),
    reasons: buildReasons(destination, preferences, difficulty),
    dayPlan: buildDayPlan(routePlaces, preferences, transportLabel),
    equipment: (destinationGuide?.whatToTake ?? defaultEquipment).slice(0, 5),
    warnings: (destinationGuide?.warnings ?? destination.safetyTips ?? defaultWarnings).slice(0, 4),
    overnight: buildOvernightPlan(preferences.days, destination.name),
    alternative: `If the road or weather changes, switch the main stop to ${alternativeDestination.name}. The route stays useful without forcing a risky transfer.`,
    preferences,
  };
}

export function serializeGeneratedRoute(input: RoutePreferences) {
  const preferences = normalizePreferences(input);

  return [
    generatedRoutePrefix,
    preferences.days,
    preferences.start,
    preferences.destinationId,
    preferences.interest,
    preferences.pace.toLowerCase(),
    preferences.transport,
    preferences.group,
    preferences.budget,
  ].join(":");
}

export function parseGeneratedRouteId(value: string): GeneratedRoutePlan | null {
  const parts = value.split(":");
  if (parts.length !== 10 || `${parts[0]}:${parts[1]}` !== generatedRoutePrefix) {
    return null;
  }

  const days = Number(parts[2]);
  const start = parts[3] as RouteStart;
  const destinationId = parts[4];
  const interest = parts[5] as RouteInterest;
  const paceToken = parts[6];
  const transport = parts[7] as RouteTransport;
  const group = parts[8] as RouteGroup;
  const budget = parts[9] as RouteBudget;
  const pace = routePaces.find((item) => item.toLowerCase() === paceToken);

  if (
    !Number.isFinite(days) ||
    !routeStartOptions.some((item) => item.id === start) ||
    !isRouteDestinationCompatible(destinationId, transport) ||
    !routeInterests.some((item) => item.id === interest) ||
    !pace ||
    !routeTransportOptions.some((item) => item.id === transport) ||
    !routeGroupOptions.some((item) => item.id === group) ||
    !routeBudgetOptions.some((item) => item.id === budget)
  ) {
    return null;
  }

  return buildGeneratedRoute({
    days,
    start,
    destinationId,
    interest,
    pace,
    transport,
    group,
    budget,
  });
}

function normalizePreferences(input: RoutePreferences): RoutePreferences {
  const destinationId = isRouteDestinationCompatible(input.destinationId, input.transport)
    ? input.destinationId
    : input.transport === "sedan"
      ? "torysh"
      : "bozzhyra";

  return {
    ...input,
    days: Math.max(1, Math.min(5, Math.round(input.days))),
    destinationId,
  };
}

function buildRoutePlaceIds(destination: TravelPlace, preferences: RoutePreferences) {
  if (preferences.transport === "sedan") {
    return ["aktau", ...(destination.id === "caspian-sea" ? [] : ["caspian-sea"]), destination.id]
      .filter((id, index, ids) => ids.indexOf(id) === index);
  }

  const preferredIdsByInterest: Record<RouteInterest, string[]> = {
    nature: ["torysh", "sherkala", "tuzbair", "bozzhyra"],
    photography: ["torysh", "sherkala", "tuzbair", "bozzhyra"],
    culture: ["shakpak-ata", "sherkala", "torysh", "bozzhyra"],
    family: ["caspian-sea", "torysh", "sherkala"],
    desert: ["tuzbair", "bozzhyra", "sherkala"],
  };
  const maxStops = Math.min(6, Math.max(2, preferences.days + (preferences.pace === "Active" ? 2 : 1)));
  const routeIds = ["aktau"];

  for (const id of preferredIdsByInterest[preferences.interest]) {
    if (routeIds.length >= maxStops || id === destination.id) break;
    if (PLACES.some((place) => place.id === id)) routeIds.push(id);
  }

  if (!routeIds.includes(destination.id)) routeIds.push(destination.id);

  return routeIds.filter((id, index, ids) => ids.indexOf(id) === index);
}

function estimateRoadDistance(places: TravelPlace[], start: RouteStart) {
  const outboundDistance = places.slice(1).reduce((total, place, index) => {
    return total + getHaversineDistanceKm(places[index].coordinates, place.coordinates);
  }, 0);
  const returnDistance =
    places.length > 1
      ? getHaversineDistanceKm(places.at(-1)?.coordinates ?? places[0].coordinates, places[0].coordinates)
      : 0;
  const pickupDistance = start === "airport" ? 30 : 0;

  return Math.max(
    25,
    Math.round(((outboundDistance + returnDistance) * 1.18 + pickupDistance) / 5) * 5
  );
}

function formatDriveTime(distanceKm: number, days: number) {
  const hours = Math.max(2, Math.round(distanceKm / 52));
  return days === 1 ? `${hours}h on the road` : `${Math.ceil(hours / days)}-${Math.ceil(hours / days) + 1}h driving / day`;
}

function inferDifficulty(destination: TravelPlace, transport: RouteTransport) {
  if (destination.category === "desert" && transport === "sedan") return "Not recommended";
  if (destination.category === "desert") return "Hard";
  if (destination.category === "nature") return "Moderate";
  return "Easy";
}

function estimateBudget(preferences: RoutePreferences) {
  const dailyRate: Record<RouteBudget, number> = {
    smart: 42000,
    standard: 72000,
    premium: 125000,
  };
  const groupFactor: Record<RouteGroup, number> = {
    solo: 1,
    friends: 1.7,
    family: 2,
  };
  const transportFactor: Record<RouteTransport, number> = {
    sedan: 0.82,
    suv: 1,
    driver: 1.32,
  };
  const estimate =
    dailyRate[preferences.budget] *
    groupFactor[preferences.group] *
    transportFactor[preferences.transport] *
    preferences.days;
  const low = Math.round(estimate / 10000) * 10;
  const high = Math.round((estimate * 1.24) / 10000) * 10;

  return `₸${low}k–${high}k / group`;
}

function buildDescription(destination: TravelPlace, preferences: RoutePreferences, stopCount: number) {
  const paceCopy: Record<RoutePace, string> = {
    Relaxed: "fewer transfers and longer stops",
    Balanced: "a practical balance of road time and viewpoints",
    Active: "early departures and more landscape stops",
  };

  return `${preferences.days}-day Mangystau plan with ${stopCount} meaningful stops and ${destination.name} as the main highlight. It prioritizes ${paceCopy[preferences.pace]} instead of stacking disconnected attractions. Distance and driving time include the return to Aktau.`;
}

function buildReasons(destination: TravelPlace, preferences: RoutePreferences, difficulty: string) {
  const groupReason: Record<RouteGroup, string> = {
    solo: "The route keeps logistics simple and recommends a local guide for remote sectors.",
    friends: "Road time and viewpoint stops are paced well for a small group.",
    family: "The plan keeps a daylight buffer and avoids unnecessary remote detours.",
  };

  return [
    `${destination.name} matches your ${getOptionLabel(routeInterests, preferences.interest).toLowerCase()} preference.`,
    groupReason[preferences.group],
    `${difficulty} difficulty is surfaced before departure, with an alternative if conditions change.`,
  ];
}

function buildDayPlan(places: TravelPlace[], preferences: RoutePreferences, transportLabel: string) {
  const destinationStops = places.filter((place) => place.id !== "aktau");
  const stopsByDay = Array.from({ length: preferences.days }, () => [] as TravelPlace[]);

  destinationStops.forEach((stop, index) => {
    const dayIndex = Math.min(
      preferences.days - 1,
      Math.floor((index * preferences.days) / Math.max(1, destinationStops.length))
    );
    stopsByDay[dayIndex].push(stop);
  });

  return stopsByDay.map((stops, dayIndex) => {
    const day = dayIndex + 1;
    const stopNames = stops.map((stop) => stop.name).join(" → ");

    if (day === 1) {
      const pickupNote = preferences.start === "airport" ? "collect supplies in Aktau, " : "";
      const returnNote =
        preferences.days === 1
          ? " Return to Aktau before dark with a two-hour daylight buffer."
          : "";
      return `Day 1 · Start at ${getOptionLabel(routeStartOptions, preferences.start)}, ${pickupNote}confirm ${transportLabel.toLowerCase()}, water and offline maps, then continue to ${stopNames || "the first viewpoint"}.${returnNote}`;
    }

    if (day === preferences.days) {
      return `Day ${day} · ${stopNames || "Flexible return and weather buffer"}; keep a two-hour daylight buffer for the return to Aktau.`;
    }

    return `Day ${day} · ${stopNames || "Weather, rest and supplies buffer"}; protect time for photos, meals and changing road conditions.`;
  });
}

function buildOvernightPlan(days: number, destinationName: string) {
  if (days === 1) return ["No overnight stop: return to Aktau before dark."];
  if (days === 2) return [`One guide-arranged camp or guesthouse near the ${destinationName} route.`];

  return [
    "First night in Aktau for supplies and an early departure.",
    `One guide-arranged camp or guesthouse near the ${destinationName} route.`,
  ];
}

function chooseAlternative(
  destinationId: string,
  group: RouteGroup,
  transport: RouteTransport
) {
  const alternativeId =
    transport === "sedan"
      ? destinationId === "torysh"
        ? "caspian-sea"
        : "torysh"
      : group === "family"
        ? destinationId === "caspian-sea"
          ? "torysh"
          : "caspian-sea"
        : destinationId === "bozzhyra"
          ? "tuzbair"
          : "bozzhyra";
  return PLACES.find((place) => place.id === alternativeId) ?? PLACES[0];
}

function getOptionLabel<T extends readonly { id: string; label: string }[]>(options: T, id: T[number]["id"]) {
  return options.find((option) => option.id === id)?.label ?? id;
}

const defaultEquipment = [
  "4–5 litres of water per person",
  "Offline map and charged power bank",
  "Sun protection and warm evening layer",
  "First-aid kit",
  "Spare tyre and basic recovery gear",
];

const defaultWarnings = [
  "Check wind and rain before leaving paved roads.",
  "Do not drive remote tracks after dark.",
  "Share the route and expected return time with someone in Aktau.",
];
