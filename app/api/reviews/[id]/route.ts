import { NextResponse } from "next/server";
import { isAuthConfigured, readRequestSession } from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { validateReviewInput } from "@/lib/reviewValidation";

type ReviewRouteContext = { params: Promise<{ id: string }> };

function unavailable() {
  return NextResponse.json(
    { error: "Community reviews are temporarily unavailable.", code: "REVIEWS_UNAVAILABLE" },
    { status: 503 }
  );
}

export async function PATCH(request: Request, context: ReviewRouteContext) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to edit your review." }, { status: 401 });
    const limited = enforceRateLimit(request, {
      namespace: "review-update",
      limit: 20,
      windowMs: 10 * 60_000,
      identity: session.id,
    });
    if (limited) return limited;

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const validated = validateReviewInput(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Check the highlighted review fields.", fieldErrors: validated.errors },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.review.findUnique({ where: { id }, select: { touristId: true } });
    if (!existing) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    if (existing.touristId !== session.id) {
      return NextResponse.json({ error: "You can only edit your own review." }, { status: 403 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: validated.data,
      select: { id: true, rating: true, title: true, text: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({
      review: { ...review, author: session.name?.trim() || "Mangystau traveler", isOwner: true },
    });
  } catch (error) {
    console.error("Review update failed", error);
    return unavailable();
  }
}

export async function DELETE(request: Request, context: ReviewRouteContext) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  if (!process.env.DATABASE_URL?.trim() || !isAuthConfigured()) return unavailable();

  try {
    const session = readRequestSession(request);
    if (!session) return NextResponse.json({ error: "Log in to delete your review." }, { status: 401 });
    const limited = enforceRateLimit(request, {
      namespace: "review-delete",
      limit: 12,
      windowMs: 10 * 60_000,
      identity: session.id,
    });
    if (limited) return limited;

    const { id } = await context.params;
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.review.findUnique({ where: { id }, select: { touristId: true } });
    if (!existing) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    if (existing.touristId !== session.id) {
      return NextResponse.json({ error: "You can only delete your own review." }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Review delete failed", error);
    return unavailable();
  }
}
