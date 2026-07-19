import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  locationFindMany: vi.fn(),
  locationUpsert: vi.fn(),
  locationDeleteMany: vi.fn(),
  routeFindMany: vi.fn(),
  routeUpsert: vi.fn(),
  routeDeleteMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    savedLocation: {
      findMany: prismaMocks.locationFindMany,
      upsert: prismaMocks.locationUpsert,
      deleteMany: prismaMocks.locationDeleteMany,
    },
    savedRoute: {
      findMany: prismaMocks.routeFindMany,
      upsert: prismaMocks.routeUpsert,
      deleteMany: prismaMocks.routeDeleteMany,
    },
  },
}));

import {
  DELETE as deleteLocation,
  POST as saveLocation,
} from "@/app/api/saved-locations/route";
import {
  DELETE as deleteRoute,
  POST as saveRoute,
} from "@/app/api/saved-routes/route";
import { authCookieName, createSessionToken } from "@/lib/auth";
import { buildGeneratedRoute, defaultRoutePreferences } from "@/lib/generatedRoute";

let requestCounter = 0;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  vi.stubEnv("AUTH_SECRET", "test-secret-that-is-longer-than-thirty-two-characters");
});

describe("saved content route handlers", () => {
  it("persists a guide-only destination for the signed-in owner", async () => {
    prismaMocks.locationUpsert.mockResolvedValue({
      id: "saved-location-1",
      locationId: "beket-ata",
      savedAt: new Date("2026-07-19T00:00:00.000Z"),
    });

    const response = await saveLocation(authenticatedRequest(
      "/api/saved-locations",
      "POST",
      { locationId: "beket-ata" }
    ));

    expect(response.status).toBe(201);
    expect(prismaMocks.locationUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          touristId_locationId: { touristId: "tourist-1", locationId: "beket-ata" },
        },
      })
    );
  });

  it("saves and removes a valid generated route only for the session owner", async () => {
    const plan = buildGeneratedRoute(defaultRoutePreferences);
    prismaMocks.routeUpsert.mockResolvedValue({
      id: "saved-route-1",
      planId: plan.id,
      title: plan.title,
      updatedAt: new Date("2026-07-19T00:00:00.000Z"),
    });

    const saveResponse = await saveRoute(authenticatedRequest(
      "/api/saved-routes",
      "POST",
      { planId: plan.id }
    ));
    expect(saveResponse.status).toBe(201);
    expect(prismaMocks.routeUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { touristId_planId: { touristId: "tourist-1", planId: plan.id } },
      })
    );

    const deleteResponse = await deleteRoute(authenticatedRequest(
      "/api/saved-routes",
      "DELETE",
      { planId: plan.id }
    ));
    expect(deleteResponse.status).toBe(200);
    expect(prismaMocks.routeDeleteMany).toHaveBeenCalledWith({
      where: { touristId: "tourist-1", planId: plan.id },
    });
  });

  it("scopes location deletion to the authenticated tourist", async () => {
    const response = await deleteLocation(authenticatedRequest(
      "/api/saved-locations",
      "DELETE",
      { locationId: "bozzhyra" }
    ));

    expect(response.status).toBe(200);
    expect(prismaMocks.locationDeleteMany).toHaveBeenCalledWith({
      where: { touristId: "tourist-1", locationId: "bozzhyra" },
    });
  });

  it("rejects saved-content mutations without a session", async () => {
    const request = new Request("http://localhost/api/saved-routes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
        "X-Forwarded-For": `anonymous-${requestCounter++}`,
      },
      body: JSON.stringify({ planId: buildGeneratedRoute(defaultRoutePreferences).id }),
    });

    const response = await saveRoute(request);
    expect(response.status).toBe(401);
    expect(prismaMocks.routeUpsert).not.toHaveBeenCalled();
  });
});

function authenticatedRequest(path: string, method: "POST" | "DELETE", body: unknown) {
  const token = createSessionToken({
    id: "tourist-1",
    email: "aruzhan@example.com",
    name: "Aruzhan",
  });

  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: `${authCookieName}=${token}`,
      Origin: "http://localhost",
      "X-Forwarded-For": `saved-content-${requestCounter++}`,
    },
    body: JSON.stringify(body),
  });
}
