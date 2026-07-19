import { describe, expect, it } from "vitest";

import {
  buildGeneratedRoute,
  defaultRoutePreferences,
  parseGeneratedRouteId,
  serializeGeneratedRoute,
  type RoutePreferences,
} from "@/lib/generatedRoute";
import { getHaversineDistanceKm } from "@/lib/geo";
import { getPlacesByIds } from "@/lib/siteData";

describe("generated route serialization", () => {
  it("round-trips normalized preferences through the shareable id", () => {
    const preferences: RoutePreferences = {
      ...defaultRoutePreferences,
      days: 5,
      start: "airport",
      destinationId: "tuzbair",
      interest: "nature",
      pace: "Active",
      transport: "suv",
      group: "solo",
      budget: "premium",
    };

    const id = serializeGeneratedRoute(preferences);
    const restored = parseGeneratedRouteId(id);

    expect(restored).not.toBeNull();
    expect(restored?.id).toBe(id);
    expect(restored?.preferences).toEqual(preferences);
  });

  it.each([
    "",
    "mt-route:v1:3:aktau:missing:nature:balanced:suv:friends:standard",
    "mt-route:v1:99:aktau:bozzhyra:nature:balanced:sedan:friends:standard",
    "mt-route:v2:3:aktau:bozzhyra:nature:balanced:suv:friends:standard",
  ])("rejects malformed or unsafe ids: %s", (id) => {
    expect(parseGeneratedRouteId(id)).toBeNull();
  });
});

describe("generated route safety and estimates", () => {
  it("includes the return to Aktau in the displayed driving distance", () => {
    const plan = buildGeneratedRoute({
      ...defaultRoutePreferences,
      destinationId: "bozzhyra",
      transport: "suv",
    });
    const places = getPlacesByIds(plan.placeIds);
    const outboundDistance = places.slice(1).reduce(
      (total, place, index) =>
        total + getHaversineDistanceKm(places[index].coordinates, place.coordinates),
      0
    );
    const returnDistance = getHaversineDistanceKm(
      places.at(-1)?.coordinates ?? places[0].coordinates,
      places[0].coordinates
    );
    const expectedRoundTrip =
      Math.max(25, Math.round(((outboundDistance + returnDistance) * 1.18) / 5) * 5);
    const oldOneWayEstimate =
      Math.max(25, Math.round((outboundDistance * 1.18) / 5) * 5);

    expect(plan.distanceKm).toBe(expectedRoundTrip);
    expect(plan.distanceKm).toBeGreaterThan(oldOneWayEstimate);
    expect(plan.description).toContain("return to Aktau");
  });

  it("replaces an off-road destination with a sedan-safe plan", () => {
    const plan = buildGeneratedRoute({
      ...defaultRoutePreferences,
      destinationId: "bozzhyra",
      transport: "sedan",
    });

    expect(plan.preferences.destinationId).toBe("torysh");
    expect(plan.placeIds).toEqual(["aktau", "caspian-sea", "torysh"]);
    expect(plan.placeIds).not.toContain("bozzhyra");
    expect(plan.placeIds).not.toContain("tuzbair");
    expect(plan.alternative).toContain("Caspian Sea");
  });
});
