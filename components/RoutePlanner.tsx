"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PLACES, ROUTES, TravelPlace, buildRouteToPlace, getPlacesByIds } from "@/lib/siteData";

const interestOptions = [
  { id: "nature", label: "Nature" },
  { id: "city", label: "City" },
  { id: "culture", label: "Culture" },
  { id: "desert", label: "Desert" },
] as const;

const paceOptions = ["Relaxed", "Balanced", "Active"] as const;
const baseOptions = [
  { id: "almaty", label: "Almaty" },
  { id: "astana", label: "Astana" },
  { id: "aktau", label: "Aktau" },
] as const;

type RoutePlannerProps = {
  onRouteChange?: (placeIds: string[]) => void;
};

export default function RoutePlanner({ onRouteChange }: RoutePlannerProps) {
  const [days, setDays] = useState(3);
  const [interest, setInterest] = useState<(typeof interestOptions)[number]["id"]>("nature");
  const [pace, setPace] = useState<(typeof paceOptions)[number]>("Balanced");
  const [startBase, setStartBase] = useState<(typeof baseOptions)[number]["id"]>("almaty");
  const [selectedPlaceId, setSelectedPlaceId] = useState(PLACES[2].id);

  const generatedRoute = useMemo(() => {
    const adjustedDays = Math.max(1, Math.min(5, days));
    const roadToPlace = buildRouteToPlace(selectedPlaceId, days);
    const scored = ROUTES.map((route) => {
      const places = getPlacesByIds(route.placeIds);
      const categoryScore = places.some((place) => place.category === interest) ? 3 : 0;
      const daysScore = Math.max(0, 3 - Math.abs(route.days - days));
      const destinationScore = route.placeIds.includes(selectedPlaceId) ? 2 : 0;
      const paceScore =
        pace === "Active" && route.days <= days
          ? 1
          : pace === "Relaxed" && route.days >= days
            ? 1
            : 0;

      return {
        route,
        score: categoryScore + daysScore + destinationScore + paceScore,
      };
    }).sort((a, b) => b.score - a.score);

    const matchedTemplate = scored[0].route;
    const selectedPlace = PLACES.find((place) => place.id === selectedPlaceId);
    const scenicPlaceIds = selectedPlace
      ? buildScenicRoutePlaceIds({
          destination: selectedPlace,
          days: adjustedDays,
          interest,
          pace,
          startBase,
        })
      : roadToPlace.placeIds;
    const shouldCreateCustomRoute =
      Boolean(selectedPlace) &&
      (selectedPlace?.category === interest || selectedPlace?.id === selectedPlaceId || matchedTemplate.days !== adjustedDays);

    if (selectedPlace && shouldCreateCustomRoute) {
      const dayPlan = buildDailyPlan({
        destination: selectedPlace,
        days: adjustedDays,
        pace,
        startBase,
        transport: roadToPlace.transport,
      });

      return {
        id: `road-${selectedPlace.id}`,
        title: `${selectedPlace.name} Easy Route`,
        mood: `${pace} plan from ${baseOptions.find((base) => base.id === startBase)?.label}`,
        days: adjustedDays,
        distance: estimateRouteDistance(selectedPlace, startBase),
        placeIds: scenicPlaceIds,
        description: buildRouteDescription(selectedPlace, adjustedDays, pace, startBase, scenicPlaceIds.length),
        steps: dayPlan,
      };
    }

    return matchedTemplate;
  }, [days, interest, pace, selectedPlaceId, startBase]);

  const routePlaces = getPlacesByIds(generatedRoute.placeIds);

  const handleApplyRoute = () => {
    onRouteChange?.(generatedRoute.placeIds);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 md:p-6"
      >
        <p className="text-sm uppercase tracking-[0.24em] text-white/40">AI route generator</p>
        <h3 className="mt-3 text-xl font-semibold md:text-2xl">Build your path</h3>

        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm text-white/60">Trip length: {days} days</span>
            <input
              type="range"
              min="1"
              max="5"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="mt-3 w-full accent-indigo-400"
            />
          </label>

          <div className="space-y-3">
            <p className="text-sm text-white/60">Starting point</p>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
              {baseOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setStartBase(option.id)}
                  className={`btn shrink-0 ${startBase === option.id ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-white/60">Main interest</p>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
              {interestOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setInterest(option.id)}
                  className={`btn shrink-0 ${interest === option.id ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-3">
            <span className="text-sm text-white/60">Destination</span>
            <select
              value={selectedPlaceId}
              onChange={(event) => setSelectedPlaceId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-4 text-white outline-none focus:border-white/30"
            >
              {PLACES.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-3">
            <p className="text-sm text-white/60">Travel pace</p>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
              {paceOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setPace(option)}
                  className={`btn shrink-0 ${pace === option ? "btn-active" : "bg-white/5 text-white/80"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleApplyRoute} className="btn chat-button w-full">
            Build tourist-friendly route
          </button>
        </div>
      </motion.div>

      <motion.div
        key={generatedRoute.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 md:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/40">{generatedRoute.mood}</p>
            <h3 className="mt-3 text-xl font-semibold md:text-2xl">{generatedRoute.title}</h3>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            {generatedRoute.days} days / {generatedRoute.distance}
          </div>
        </div>

        <p className="mt-5 leading-7 text-white/70">{generatedRoute.description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Comfort</p>
            <p className="mt-2 text-sm text-white/75">{pace} pace</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Tip</p>
            <p className="mt-2 text-sm text-white/75">Keep the last day flexible</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Offline</p>
            <p className="mt-2 text-sm text-white/75">Download maps before leaving</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {generatedRoute.steps.map((step) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/75">
              {step}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {routePlaces.map((place, index) => (
            <span key={place.id} className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              {index + 1}. {place.name}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {PLACES.filter((place) => generatedRoute.placeIds.includes(place.id)).map((place) => (
            <div key={place.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white/90">{place.name}</p>
              <p className="mt-2 text-xs leading-5 text-white/50">{place.desc}</p>
              <p className="mt-3 text-xs text-white/40">{place.bestTime}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function buildDailyPlan({
  destination,
  days,
  pace,
  startBase,
  transport,
}: {
  destination: TravelPlace;
  days: number;
  pace: (typeof paceOptions)[number];
  startBase: (typeof baseOptions)[number]["id"];
  transport: string;
}) {
  const baseLabel = baseOptions.find((base) => base.id === startBase)?.label ?? "Almaty";
  const scenicIds = buildScenicRoutePlaceIds({
    destination,
    days,
    interest: destination.category,
    pace,
    startBase,
  });
  const scenicStops = getPlacesByIds(scenicIds).filter((place) => place.id !== destination.id);
  const stopText = scenicStops.length > 0 ? scenicStops.map((place) => place.name).join(" -> ") : baseLabel;
  const slowerNote =
    pace === "Relaxed"
      ? "leave extra time for meals, photos and rest stops"
      : pace === "Active"
        ? "start early and keep sightseeing grouped by location"
        : "balance road time with one strong highlight";

  if (days === 1) {
    return [
      `Morning: start from ${baseLabel}, confirm ${transport}, water and offline map.`,
      `Midday: visit ${destination.name}, focus on the safest main viewpoint or central area.`,
      `Evening: use ${stopText} as light stops instead of turning the day into one long straight transfer.`,
    ];
  }

  const plan = [
    `Day 1: Arrive in ${baseLabel}, check weather, transport and supplies, then keep the evening light.`,
    `Day 2: Move through ${stopText} by ${transport}; ${slowerNote}.`,
  ];

  if (days >= 3) {
    plan.push(
      `Day 3: Spend the calmest part of the day at ${destination.name}, add nearby stops only if the road is comfortable.`
    );
  }

  if (days >= 4) {
    plan.push(
      "Day 4: Add a buffer day for weather, guide timing, local food and a shorter transfer."
    );
  }

  if (days >= 5) {
    plan.push(
      "Day 5: Return slowly, keep one optional viewpoint, and avoid stacking long drives."
    );
  }

  return plan;
}

function buildRouteDescription(
  destination: TravelPlace,
  days: number,
  pace: (typeof paceOptions)[number],
  startBase: (typeof baseOptions)[number]["id"],
  stopCount: number
) {
  const baseLabel = baseOptions.find((base) => base.id === startBase)?.label ?? "Almaty";
  const categoryAdvice: Record<TravelPlace["category"], string> = {
    city: "short transfers, food stops and easy navigation",
    nature: "early departures, weather checks and time at viewpoints",
    culture: "heritage stops, slower evenings and local food",
    desert: "4x4 logistics, water planning and guide timing",
  };

  return `${days}-day ${pace.toLowerCase()} route from ${baseLabel} to ${destination.name} through ${stopCount} highlighted places, designed for ${categoryAdvice[destination.category]} instead of a straight transfer.`;
}

function estimateRouteDistance(destination: TravelPlace, startBase: (typeof baseOptions)[number]["id"]) {
  if (destination.category === "desert" || startBase === "aktau") return "remote desert route";
  if (destination.id === "astana" || startBase === "astana") return "city / flight-friendly";
  if (destination.id === "turkistan") return "southern Kazakhstan";
  return destination.region;
}

function buildScenicRoutePlaceIds({
  destination,
  days,
  interest,
  pace,
  startBase,
}: {
  destination: TravelPlace;
  days: number;
  interest: (typeof interestOptions)[number]["id"];
  pace: (typeof paceOptions)[number];
  startBase: (typeof baseOptions)[number]["id"];
}) {
  const basePlaceIdByStart: Record<(typeof baseOptions)[number]["id"], string> = {
    almaty: "almaty",
    astana: "astana",
    aktau: "aktau",
  };
  const startId = basePlaceIdByStart[startBase];
  const maxStops = Math.min(5, Math.max(3, days + (pace === "Active" ? 1 : 0)));
  const routeIds = [startId];

  const addStop = (id: string) => {
    if (PLACES.some((place) => place.id === id) && !routeIds.includes(id) && id !== destination.id) {
      routeIds.push(id);
    }
  };

  if (destination.region === "Mangystau" || startBase === "aktau") {
    addStop("shakpak-ata");
    addStop("sherkala");
  } else if (destination.category === "nature" || interest === "nature") {
    addStop(destination.id === "kaindy" ? "charyn" : "kaindy");
  } else if (destination.category === "culture" || interest === "culture") {
    addStop("almaty");
  } else if (destination.category === "city") {
    addStop(destination.id === "astana" ? "turkistan" : "astana");
  }

  const scoredStops = PLACES.filter(
    (place) => place.id !== startId && place.id !== destination.id && !routeIds.includes(place.id)
  )
    .map((place) => ({
      place,
      score:
        (place.category === interest ? 4 : 0) +
        (place.region === destination.region ? 3 : 0) +
        (place.category === destination.category ? 2 : 0) +
        (place.category === "city" ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  for (const { place } of scoredStops) {
    if (routeIds.length >= maxStops - 1) break;
    addStop(place.id);
  }

  routeIds.push(destination.id);
  return routeIds.filter((id, index, ids) => ids.indexOf(id) === index);
}
