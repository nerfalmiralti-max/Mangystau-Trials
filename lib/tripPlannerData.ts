import { guideDestinations, type GuideDestination } from "@/lib/guideData";

export type PlannerDuration = "1 day" | "Weekend" | "3 days";
export type PlannerTheme = "Budget" | "Nature" | "History" | "Family" | "Adventure";

export type PlannerPlan = {
  id: string;
  title: string;
  meta: string;
  stops: GuideDestination[];
  days: string[];
};

export const plannerDurations: PlannerDuration[] = ["1 day", "Weekend", "3 days"];
export const plannerThemes: PlannerTheme[] = ["Budget", "Nature", "History", "Family", "Adventure"];

export function getPlannerRouteId(duration: PlannerDuration, theme: PlannerTheme) {
  return `${duration.toLowerCase().replace(/\s+/g, "-")}:${theme.toLowerCase()}`;
}

export function buildPlanner(duration: PlannerDuration, theme: PlannerTheme): PlannerPlan {
  const byId = new Map(guideDestinations.map((destination) => [destination.id, destination]));
  const stopIdsByTheme: Record<PlannerTheme, string[]> = {
    Budget: ["aktau-seaside", "torysh", "sherkala"],
    Nature: ["torysh", "sherkala", "bozzhyra"],
    History: ["sultan-epe", "beket-ata", "sherkala"],
    Family: ["aktau-seaside", "saura", "torysh"],
    Adventure: ["tuzbair", "bozzhyra", "karynzharyk"],
  };
  const limitByDuration: Record<PlannerDuration, number> = {
    "1 day": 2,
    Weekend: 3,
    "3 days": 4,
  };
  const stops = stopIdsByTheme[theme]
    .map((id) => byId.get(id))
    .filter((destination): destination is GuideDestination => Boolean(destination))
    .slice(0, limitByDuration[duration]);
  const lastStop = stops[stops.length - 1] ?? guideDestinations[0];
  const daysByDuration: Record<PlannerDuration, string[]> = {
    "1 day": [
      `Morning: start from Aktau and keep the first stop short at ${stops[0]?.name ?? "Aktau Seaside"}.`,
      `Afternoon: focus on ${lastStop.name}, then return before dark.`,
    ],
    Weekend: [
      `Day 1: arrive in Aktau, check supplies and make a light stop at ${stops[0]?.name ?? "the coast"}.`,
      `Day 2: follow the main route through ${stops.slice(1).map((stop) => stop.name).join(" and ")}.`,
      "Day 3: keep a buffer for weather, photos and a calm return.",
    ],
    "3 days": [
      `Day 1: base in Aktau, supplies, sea walk and route briefing for ${theme.toLowerCase()} travel.`,
      `Day 2: visit ${stops.slice(0, 2).map((stop) => stop.name).join(" and ")} with a steady pace.`,
      `Day 3: make ${lastStop.name} the main highlight, then return with daylight buffer.`,
    ],
  };

  return {
    id: getPlannerRouteId(duration, theme),
    title: `${duration} ${theme} route`,
    meta: `${stops.length} stops / ${lastStop.transportType}`,
    stops,
    days: daysByDuration[duration],
  };
}

export function parsePlannerRouteId(routeId: string): PlannerPlan | null {
  const [durationToken, themeToken] = routeId.split(":");
  const duration = plannerDurations.find(
    (item) => item.toLowerCase().replace(/\s+/g, "-") === durationToken
  );
  const theme = plannerThemes.find((item) => item.toLowerCase() === themeToken);

  if (!duration || !theme) {
    return null;
  }

  return buildPlanner(duration, theme);
}
