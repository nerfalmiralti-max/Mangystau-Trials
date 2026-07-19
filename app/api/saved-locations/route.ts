import { NextResponse } from "next/server";
import { isAuthConfigured, readRequestSession } from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { guideDestinations } from "@/lib/guideData";
import { PLACES } from "@/lib/siteData";

const supportedLocationIds = new Set([
  ...PLACES.map((place) => place.id),
  ...guideDestinations.map((destination) => destination.id),
]);

function unavailable() {
  return NextResponse.json(
    { error: "Account sync is temporarily unavailable.", code: "ACCOUNT_SERVICE_UNAVAILABLE" },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to sync saved places." }, { status: 401 });

    const { prisma } = await import("@/lib/prisma");
    const savedLocations = await prisma.savedLocation.findMany({
      where: { touristId: session.id },
      select: { id: true, locationId: true, savedAt: true },
      orderBy: { savedAt: "desc" },
    });
    return NextResponse.json({ savedLocations }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Saved location lookup failed", error);
    return unavailable();
  }
}

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const limited = enforceRateLimit(request, { namespace: "saved-location", limit: 40, windowMs: 60_000 });
  if (limited) return limited;
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to sync saved places." }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const locationId = typeof body.locationId === "string" ? body.locationId.trim() : "";
    if (!supportedLocationIds.has(locationId)) {
      return NextResponse.json({ error: "Choose a valid destination." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");
    const savedLocation = await prisma.savedLocation.upsert({
      where: { touristId_locationId: { touristId: session.id, locationId } },
      update: { savedAt: new Date() },
      create: { touristId: session.id, locationId },
      select: { id: true, locationId: true, savedAt: true },
    });
    return NextResponse.json({ savedLocation }, { status: 201 });
  } catch (error) {
    console.error("Saved location create failed", error);
    return unavailable();
  }
}

export async function DELETE(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const limited = enforceRateLimit(request, { namespace: "saved-location-delete", limit: 40, windowMs: 60_000 });
  if (limited) return limited;
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to sync saved places." }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const locationId = typeof body.locationId === "string" ? body.locationId.trim() : "";
    if (!locationId) return NextResponse.json({ error: "A destination is required." }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    await prisma.savedLocation.deleteMany({ where: { touristId: session.id, locationId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Saved location delete failed", error);
    return unavailable();
  }
}
