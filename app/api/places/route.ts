import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - получить все места
export async function GET() {
  const places = await prisma.place.findMany();
  return NextResponse.json(places);
}

// POST - создать место
export async function POST(req: Request) {
  const body = await req.json();

  const place = await prisma.place.create({
    data: {
      name: body.name,
      description: body.description,
      lat: body.lat,
      lng: body.lng,
      image: body.image || null,
    },
  });

  return NextResponse.json(place);
}