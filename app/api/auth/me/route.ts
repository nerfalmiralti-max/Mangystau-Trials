import { NextResponse } from "next/server";
import { getAuthConfigurationProblem, readRequestSession } from "@/lib/auth";

export async function GET(req: Request) {
  const developmentDetails = !process.env.DATABASE_URL?.trim()
    ? "DATABASE_URL is missing."
    : process.env.NODE_ENV === "production"
      ? getAuthConfigurationProblem()
      : null;

  if (developmentDetails) {
    return NextResponse.json(
      {
        error: "Secure account storage is not configured for this deployment.",
        code: "ACCOUNT_NOT_CONFIGURED",
        retryable: false,
        ...(process.env.NODE_ENV === "development" ? { developmentDetails } : {}),
      },
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
        savedLocations: {
          select: { locationId: true },
          orderBy: { savedAt: "desc" },
        },
        savedRoutes: {
          select: { planId: true, title: true },
          orderBy: { updatedAt: "desc" },
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
      {
        error: "We could not reach secure account storage. Please retry in a moment.",
        code: "ACCOUNT_SERVICE_UNAVAILABLE",
        retryable: true,
        ...(process.env.NODE_ENV === "development"
          ? { developmentDetails: "Database request failed; check connectivity and migrations." }
          : {}),
      },
      { status: 503 }
    );
  }
}
