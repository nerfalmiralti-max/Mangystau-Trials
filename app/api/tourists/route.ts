import { NextResponse } from "next/server";

// GET - все туристы
export async function GET() {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json([]);
  }

  try {
    const { prisma } = await import("@/lib/prisma");
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
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { error: "Storage is unavailable in demo mode." },
      { status: 503 }
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
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
