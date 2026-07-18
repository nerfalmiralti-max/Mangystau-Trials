import { NextResponse } from "next/server";
import { readRequestSession } from "@/lib/auth";

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { error: "Account service is unavailable." },
      { status: 503 }
    );
  }

  try {
    const session = readRequestSession(req);

    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const tourist = await prisma.tourist.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        country: true,
        email: true,
        createdAt: true,
        visits: {
          select: {
            id: true,
            placeId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!tourist) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json([tourist], {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Tourist lookup failed", error);
    return NextResponse.json(
      { error: "Account service is unavailable." },
      { status: 503 }
    );
  }
}
