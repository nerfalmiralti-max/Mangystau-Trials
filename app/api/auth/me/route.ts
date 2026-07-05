import { NextResponse } from "next/server";
import { authCookieName, getCookieValue, readSessionToken } from "@/lib/auth";

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({ tourist: null, localMode: true });
  }

  const token = getCookieValue(req.headers.get("cookie"), authCookieName);
  const session = readSessionToken(token);

  if (!session) {
    return NextResponse.json({ tourist: null }, { status: 401 });
  }

  try {
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

    return NextResponse.json({ tourist });
  } catch {
    return NextResponse.json({ tourist: null, database: "unavailable" });
  }
}
