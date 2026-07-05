import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - все туристы
export async function GET() {
  try {
    const tourists = await prisma.tourist.findMany({
      include: {
        visits: true,
      },
    });

    return NextResponse.json(tourists);
  } catch {
    return NextResponse.json([]);
  }
}

// POST - создать туриста
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tourist = await prisma.tourist.create({
      data: {
        name: body.name,
        country: body.country,
      },
    });

    return NextResponse.json(tourist);
  } catch {
    return NextResponse.json(
      { error: "Storage is unavailable in demo mode." },
      { status: 503 }
    );
  }
}
