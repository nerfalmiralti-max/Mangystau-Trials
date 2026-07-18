import { NextResponse } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { isAdminEmail, readRequestSession } from "@/lib/auth";
import { PLACES } from "@/lib/siteData";

const fallbackPlaces = PLACES.map((place) => ({
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
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function syncStaticPlaces(prisma: PrismaClient) {
  await Promise.all(
    PLACES.map((place) =>
      prisma.place.upsert({
        where: { id: place.id },
        update: {
          name: place.name,
          description: place.desc,
          region: place.region,
          category: place.category,
          duration: place.duration,
          bestTime: place.bestTime,
          lat: place.coordinates[0],
          lng: place.coordinates[1],
          image: place.image ?? null,
        },
        create: {
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
        },
      })
    )
  );
}

export async function GET() {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(fallbackPlaces);
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const existingStaticPlaces = await prisma.place.count({
      where: {
        id: {
          in: PLACES.map((place) => place.id),
        },
      },
    });

    if (existingStaticPlaces < PLACES.length) {
      await syncStaticPlaces(prisma);
    }

    const places = await prisma.place.findMany({
      orderBy: [{ region: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(places.length > 0 ? places : fallbackPlaces);
  } catch (error) {
    console.error("Places API failed", error);
    return NextResponse.json(fallbackPlaces);
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { error: "Storage is unavailable in demo mode." },
      { status: 503 }
    );
  }

  try {
    const session = readRequestSession(req);

    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const account = await prisma.tourist.findUnique({
      where: { id: session.id },
      select: { email: true },
    });

    if (!account || !isAdminEmail(account.email)) {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
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

    if (!name || lat === null || lng === null) {
      return NextResponse.json(
        { error: "Place name, lat and lng are required." },
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
      { error: "Failed to create place" },
      { status: 500 }
    );
  }
}
