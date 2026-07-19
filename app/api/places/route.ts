import { NextResponse } from "next/server";
import { isAdminEmail, readRequestSession } from "@/lib/auth";
import { rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { PLACES } from "@/lib/siteData";

type PublicPlace = {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  category: string | null;
  duration: string | null;
  bestTime: string | null;
  lat: number;
  lng: number;
  image: string | null;
};

const fallbackPlaces: PublicPlace[] = PLACES.map((place) => ({
  id: place.id,
  name: place.name,
  description: place.desc,
  region: place.region,
  category: place.category,
  duration: place.duration,
  bestTime: place.bestTime,
  lat: place.coordinates[0],
  lng: place.coordinates[1],
  image: place.image ?? null,
}));

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

function readNumber(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;

  const parsed = typeof value === "number" ? value : Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET() {
  if (!process.env.DATABASE_URL?.trim()) {
    return fallbackResponse();
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const places = await prisma.place.findMany({
      orderBy: [{ region: "asc" }, { name: "asc" }],
    });

    if (places.length === 0) return fallbackResponse();

    const placesById = new Map(fallbackPlaces.map((place) => [place.id, place]));
    for (const place of places) {
      placesById.set(place.id, {
        id: place.id,
        name: place.name,
        description: place.description,
        region: place.region,
        category: place.category,
        duration: place.duration,
        bestTime: place.bestTime,
        lat: place.lat,
        lng: place.lng,
        image: place.image,
      });
    }

    const mergedPlaces = Array.from(placesById.values()).sort(
      (first, second) =>
        (first.region ?? "").localeCompare(second.region ?? "") ||
        first.name.localeCompare(second.name)
    );

    return NextResponse.json(mergedPlaces);
  } catch (error) {
    console.error("Places API failed", error);
    return fallbackResponse();
  }
}

export async function POST(req: Request) {
  const originError = rejectCrossSiteMutation(req);
  if (originError) return originError;

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      {
        error: "Storage is unavailable in demo mode.",
        code: "STORAGE_UNAVAILABLE",
      },
      { status: 503 }
    );
  }

  try {
    const session = readRequestSession(req);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const account = await prisma.tourist.findUnique({
      where: { id: session.id },
      select: { email: true },
    });

    if (!account || !isAdminEmail(account.email)) {
      return NextResponse.json(
        { error: "Administrator access required.", code: "ADMIN_REQUIRED" },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const name = readText(body.name, 120);
    const description = readText(body.description, 600);
    const region = readText(body.region, 120);
    const category = readText(body.category, 80);
    const duration = readText(body.duration, 80);
    const bestTime = readText(body.bestTime, 120);
    const image = readText(body.image, 300);
    const lat = readNumber(body.lat);
    const lng = readNumber(body.lng);

    if (
      !name ||
      lat === null ||
      lng === null ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        {
          error: "Use a place name and valid latitude/longitude coordinates.",
          code: "INVALID_PLACE",
        },
        { status: 400 }
      );
    }

    const place = await prisma.place.create({
      data: {
        name,
        description: description || null,
        region: region || null,
        category: category || null,
        duration: duration || null,
        bestTime: bestTime || null,
        lat,
        lng,
        image: image || null,
      },
    });

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error("Place create failed", error);
    return NextResponse.json(
      { error: "Failed to create place.", code: "PLACE_CREATE_FAILED" },
      { status: 500 }
    );
  }
}

function fallbackResponse() {
  return NextResponse.json(fallbackPlaces, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
      "X-Mangystau-Data-Source": "static-fallback",
    },
  });
}
