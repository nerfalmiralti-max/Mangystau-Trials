import { createHash } from "crypto";
import { NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowMs: number;
  identity?: string;
};

const globalForRateLimits = globalThis as typeof globalThis & {
  mangystauRateLimits?: Map<string, RateLimitEntry>;
};

const rateLimits =
  globalForRateLimits.mangystauRateLimits ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimits.mangystauRateLimits = rateLimits;
}

export function rejectCrossSiteMutation(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return NextResponse.json(
      { error: "This request could not be verified.", code: "INVALID_ORIGIN" },
      { status: 403 }
    );
  }

  const origin = request.headers.get("origin");
  if (!origin) return null;

  try {
    if (new URL(origin).origin === new URL(request.url).origin) return null;
  } catch {
    // Invalid origins are rejected below.
  }

  return NextResponse.json(
    { error: "This request could not be verified.", code: "INVALID_ORIGIN" },
    { status: 403 }
  );
}

export function enforceRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const clientAddress = getClientAddress(request);
  const identityHash = options.identity
    ? createHash("sha256").update(options.identity).digest("hex").slice(0, 20)
    : "shared";
  const key = `${options.namespace}:${clientAddress}:${identityHash}`;
  const current = rateLimits.get(key);
  const entry = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + options.windowMs }
    : { count: current.count + 1, resetAt: current.resetAt };

  rateLimits.set(key, entry);
  pruneExpiredEntries(now);

  if (entry.count <= options.limit) return null;

  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return NextResponse.json(
    {
      error: "Too many attempts. Wait a few minutes and try again.",
      code: "RATE_LIMITED",
      retryAfter,
    },
    {
      status: 429,
      headers: { "Retry-After": retryAfter.toString() },
    }
  );
}

function getClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneExpiredEntries(now: number) {
  if (rateLimits.size < 500) return;

  for (const [key, entry] of rateLimits) {
    if (entry.resetAt <= now) rateLimits.delete(key);
  }
}
