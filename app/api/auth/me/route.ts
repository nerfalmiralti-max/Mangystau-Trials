import { NextResponse } from "next/server";
import { isAuthConfigured, readRequestSession } from "@/lib/auth";

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) {
    return NextResponse.json(
      { error: "Account service is unavailable." },
      { status: 503 }
    );
  }

  try {
    const session = readRequestSession(req);

    if (!session) {
      return NextResponse.json({ tourist: null }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const tourist = await prisma.tourist.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        createdAt: true,
        visits: {
          include: {
            place: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 4,
        },
      },
    });

    if (!tourist) {
      return NextResponse.json({ tourist: null }, { status: 401 });
    }

    return NextResponse.json(
      { tourist },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Profile lookup failed", error);
    return NextResponse.json(
      { error: "Account service is unavailable." },
      { status: 503 }
    );
  }
}
