import { NextResponse } from "next/server";

// GET - все посещения (аналитика)
export async function GET() {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json([]);
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const visits = await prisma.visit.findMany({
      include: {
        tourist: true,
        place: true,
      },
    });

    return NextResponse.json(visits);
  } catch {
    return NextResponse.json([]);
  }
}

// POST - создать посещение
export async function POST(req: Request) {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { error: "Storage is unavailable in demo mode." },
      { status: 503 }
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const body = await req.json();

    const visit = await prisma.visit.create({
      data: {
        touristId: body.touristId,
        placeId: body.placeId,
      },
    });

    return NextResponse.json(visit);
  } catch {
    return NextResponse.json(
      { error: "Storage is unavailable in demo mode." },
      { status: 503 }
    );
  }
}
