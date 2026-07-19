import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  placeUpsert: vi.fn(),
  reviewFindUnique: vi.fn(),
  reviewCreate: vi.fn(),
  reviewUpdate: vi.fn(),
  reviewDelete: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    place: { upsert: prismaMocks.placeUpsert },
    review: {
      findUnique: prismaMocks.reviewFindUnique,
      create: prismaMocks.reviewCreate,
      update: prismaMocks.reviewUpdate,
      delete: prismaMocks.reviewDelete,
    },
  },
}));

import { POST as createReview } from "@/app/api/reviews/route";
import {
  DELETE as deleteReview,
  PATCH as updateReview,
} from "@/app/api/reviews/[id]/route";
import { authCookieName, createSessionToken } from "@/lib/auth";

const review = {
  id: "review-1",
  rating: 5,
  title: "Worth the early start",
  text: "Clear skies and a local driver made the viewpoint safe and memorable.",
  createdAt: new Date("2026-07-19T00:00:00.000Z"),
  updatedAt: new Date("2026-07-19T00:00:00.000Z"),
};
let requestCounter = 0;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  vi.stubEnv("AUTH_SECRET", "test-secret-that-is-longer-than-thirty-two-characters");
});

describe("review route authorization", () => {
  it("creates a validated review for the signed-in tourist", async () => {
    prismaMocks.reviewFindUnique.mockResolvedValue(null);
    prismaMocks.reviewCreate.mockResolvedValue(review);

    const response = await createReview(authenticatedRequest(
      "/api/reviews",
      "POST",
      { placeId: "bozzhyra", rating: 5, title: review.title, text: review.text }
    ));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      review: { id: "review-1", author: "Aruzhan", isOwner: true },
    });
    expect(prismaMocks.reviewCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ touristId: "tourist-1" }) })
    );
  });

  it("refuses to edit another tourist's review", async () => {
    prismaMocks.reviewFindUnique.mockResolvedValue({ touristId: "tourist-2" });

    const response = await updateReview(
      authenticatedRequest("/api/reviews/review-1", "PATCH", review),
      { params: Promise.resolve({ id: "review-1" }) }
    );

    expect(response.status).toBe(403);
    expect(prismaMocks.reviewUpdate).not.toHaveBeenCalled();
  });

  it("updates and deletes the owner's review", async () => {
    prismaMocks.reviewFindUnique.mockResolvedValue({ touristId: "tourist-1" });
    prismaMocks.reviewUpdate.mockResolvedValue(review);

    const updateResponse = await updateReview(
      authenticatedRequest("/api/reviews/review-1", "PATCH", review),
      { params: Promise.resolve({ id: "review-1" }) }
    );
    expect(updateResponse.status).toBe(200);
    expect(prismaMocks.reviewUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "review-1" } })
    );

    const deleteResponse = await deleteReview(
      authenticatedRequest("/api/reviews/review-1", "DELETE"),
      { params: Promise.resolve({ id: "review-1" }) }
    );
    expect(deleteResponse.status).toBe(200);
    expect(prismaMocks.reviewDelete).toHaveBeenCalledWith({ where: { id: "review-1" } });
  });
});

function authenticatedRequest(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown
) {
  const token = createSessionToken({
    id: "tourist-1",
    email: "aruzhan@example.com",
    name: "Aruzhan",
  });
  const headers = new Headers({
    Cookie: `${authCookieName}=${token}`,
    Origin: "http://localhost",
    "X-Forwarded-For": `reviews-${requestCounter++}`,
  });

  if (body !== undefined) headers.set("Content-Type", "application/json");

  return new Request(`http://localhost${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
