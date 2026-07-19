import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { isAuthConfigured, readRequestSession } from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { ensureStaticPlace } from "@/lib/placePersistence";
import { validateReviewInput } from "@/lib/reviewValidation";
import { PLACES } from "@/lib/siteData";

function unavailable() {
  return NextResponse.json(
    { error: "Community reviews are temporarily unavailable.", code: "REVIEWS_UNAVAILABLE" },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  const placeId = new URL(request.url).searchParams.get("placeId")?.trim() ?? "";
  if (!PLACES.some((place) => place.id === placeId)) {
    return NextResponse.json({ error: "Choose a valid destination." }, { status: 400 });
  }
  if (!process.env.DATABASE_URL?.trim()) return unavailable();

  try {
    const session = isAuthConfigured() ? readRequestSession(request) : null;
    const { prisma } = await import("@/lib/prisma");
    const reviews = await prisma.review.findMany({
      where: { placeId },
      select: {
        id: true,
        touristId: true,
        rating: true,
        title: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        tourist: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(
      {
        reviews: reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          text: review.text,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          author: review.tourist.name?.trim() || "Mangystau traveler",
          isOwner: session?.id === review.touristId,
        })),
        authenticated: Boolean(session),
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Review lookup failed", error);
    return unavailable();
  }
}

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) {
      return NextResponse.json({ error: "Log in to publish a review.", code: "AUTH_REQUIRED" }, { status: 401 });
    }
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
    if (!PLACES.some((place) => place.id === placeId)) {
      return NextResponse.json({ error: "Choose a valid destination." }, { status: 400 });
    }
    const limited = enforceRateLimit(request, {
      namespace: "review-create",
      limit: 8,
      windowMs: 10 * 60_000,
      identity: session.id,
    });
    if (limited) return limited;

    const validated = validateReviewInput(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Check the highlighted review fields.", fieldErrors: validated.errors },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    await ensureStaticPlace(prisma, placeId);
    const existing = await prisma.review.findUnique({
      where: { touristId_placeId: { touristId: session.id, placeId } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already reviewed this destination. Edit your existing review instead." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: { touristId: session.id, placeId, ...validated.data },
      select: { id: true, rating: true, title: true, text: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(
      { review: { ...review, author: session.name?.trim() || "Mangystau traveler", isOwner: true } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "You already reviewed this destination. Edit your existing review instead.",
          code: "REVIEW_EXISTS",
        },
        { status: 409 }
      );
    }
    console.error("Review create failed", error);
    return unavailable();
  }
}
