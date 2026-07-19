import { NextResponse } from "next/server";
import { isAuthConfigured, readRequestSession } from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { parseGeneratedRouteId } from "@/lib/generatedRoute";
import { parsePlannerRouteId } from "@/lib/tripPlannerData";

function unavailable() {
  return NextResponse.json(
    { error: "Account sync is temporarily unavailable.", code: "ACCOUNT_SERVICE_UNAVAILABLE" },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to sync routes." }, { status: 401 });
    const { prisma } = await import("@/lib/prisma");
    const savedRoutes = await prisma.savedRoute.findMany({
      where: { touristId: session.id },
      select: { id: true, planId: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ savedRoutes }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Saved route lookup failed", error);
    return unavailable();
  }
}

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const limited = enforceRateLimit(request, { namespace: "saved-route", limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to sync routes." }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const planId = typeof body.planId === "string" ? body.planId.trim().slice(0, 1200) : "";
    const plan = parseGeneratedRouteId(planId) ?? parsePlannerRouteId(planId);
    if (!plan) return NextResponse.json({ error: "This route plan is not valid." }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    const savedRoute = await prisma.savedRoute.upsert({
      where: { touristId_planId: { touristId: session.id, planId } },
      update: { title: plan.title },
      create: { touristId: session.id, planId, title: plan.title },
      select: { id: true, planId: true, title: true, updatedAt: true },
    });
    return NextResponse.json({ savedRoute }, { status: 201 });
  } catch (error) {
    console.error("Saved route create failed", error);
    return unavailable();
  }
}

export async function DELETE(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const limited = enforceRateLimit(request, { namespace: "saved-route-delete", limit: 30, windowMs: 60_000 });
  if (limited) return limited;
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to sync routes." }, { status: 401 });
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const planId = typeof body.planId === "string" ? body.planId.trim().slice(0, 1200) : "";
    if (!planId) return NextResponse.json({ error: "A route plan is required." }, { status: 400 });

    const { prisma } = await import("@/lib/prisma");
    await prisma.savedRoute.deleteMany({ where: { touristId: session.id, planId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Saved route delete failed", error);
    return unavailable();
  }
}
