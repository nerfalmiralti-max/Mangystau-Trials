import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - все посещения (аналитика)
export async function GET() {
  try {
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
  try {
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
      { error: "Database is not configured for this deployment yet." },
      { status: 503 }
    );
  }
}
