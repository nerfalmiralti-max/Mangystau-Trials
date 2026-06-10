import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - все посещения (аналитика)
export async function GET() {
  const visits = await prisma.visit.findMany({
    include: {
      tourist: true,
      place: true,
    },
  });

  return NextResponse.json(visits);
}

// POST - создать посещение
export async function POST(req: Request) {
  const body = await req.json();

  const visit = await prisma.visit.create({
    data: {
      touristId: body.touristId,
      placeId: body.placeId,
    },
  });

  return NextResponse.json(visit);
}