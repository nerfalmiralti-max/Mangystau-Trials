import { NextResponse } from "next/server";
import { readRequestSession } from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";

function unavailable() {
  return NextResponse.json(
    { error: "Visit storage is unavailable.", code: "VISITS_UNAVAILABLE" },
    { status: 503 }
  );
}

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL?.trim()) {
    return unavailable();
  }

  try {
    const session = readRequestSession(req);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const rateLimitError = enforceRateLimit(req, {
      namespace: "visits:list",
      limit: 120,
      windowMs: 60 * 1000,
      identity: session.id,
    });
    if (rateLimitError) return rateLimitError;

    const { prisma } = await import("@/lib/prisma");
    const visits = await prisma.visit.findMany({
      where: { touristId: session.id },
      select: {
        id: true,
        placeId: true,
        createdAt: true,
        place: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(visits, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Visit lookup failed", error);
    return unavailable();
  }
}

export async function POST(req: Request) {
  const originError = rejectCrossSiteMutation(req);
  if (originError) return originError;

  if (!process.env.DATABASE_URL?.trim()) {
    return unavailable();
  }

  try {
    const session = readRequestSession(req);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const rateLimitError = enforceRateLimit(req, {
      namespace: "visits:create",
      limit: 30,
      windowMs: 60 * 1000,
      identity: session.id,
    });
    if (rateLimitError) return rateLimitError;

    const body = (await req.json().catch(() => ({}))) as { placeId?: unknown };
    const placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";

    if (!placeId || placeId.length > 120) {
      return NextResponse.json(
        { error: "A valid placeId is required.", code: "INVALID_PLACE_ID" },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      return NextResponse.json(
        { error: "Place not found.", code: "PLACE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        touristId: session.id,
        placeId,
      },
      select: {
        id: true,
        placeId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error("Visit create failed", error);
    return unavailable();
  }
}
