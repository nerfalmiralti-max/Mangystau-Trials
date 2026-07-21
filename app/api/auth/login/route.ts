import { NextResponse } from "next/server";
import {
  authCookieName,
  createSessionToken,
  getAuthConfigurationProblem,
  getAuthCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { validateLoginCredentials } from "@/lib/authValidation";

export async function POST(req: Request) {
  const rejected = rejectCrossSiteMutation(req);
  if (rejected) return rejected;

  const configurationError = getAccountConfigurationError();
  if (configurationError) return configurationError;

  const validation = validateLoginCredentials(await req.json().catch(() => null));

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Check your email and password.",
        code: "INVALID_INPUT",
        fieldErrors: validation.errors,
      },
      { status: 400 }
    );
  }

  const { email, password } = validation.data;
  const limited = enforceRateLimit(req, {
    namespace: "auth-login",
    limit: 10,
    windowMs: 15 * 60_000,
    identity: email,
  });
  if (limited) return limited;

  try {
    const { prisma } = await import("@/lib/prisma");
    const tourist = await prisma.tourist.findUnique({
      where: { email },
      include: {
        savedLocations: { select: { locationId: true }, orderBy: { savedAt: "desc" } },
        savedRoutes: { select: { planId: true }, orderBy: { updatedAt: "desc" } },
      },
    });
    if (!tourist || !verifyPassword(password, tourist.passwordHash)) {
      return NextResponse.json(
        {
          error: "We could not log you in. Check your password or create a new account.",
          code: "INVALID_CREDENTIALS",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      tourist: {
        id: tourist.id,
        name: tourist.name,
        email: tourist.email,
        country: tourist.country,
        createdAt: tourist.createdAt,
        savedLocations: tourist.savedLocations,
        savedRoutes: tourist.savedRoutes,
      },
    });
    response.cookies.set(
      authCookieName,
      createSessionToken({ id: tourist.id, email: tourist.email || email, name: tourist.name }),
      getAuthCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Login failed", error);
    return accountRequestFailed();
  }
}

function getAccountConfigurationError() {
  const developmentDetails = !process.env.DATABASE_URL?.trim()
    ? "DATABASE_URL is missing."
    : process.env.NODE_ENV === "production"
      ? getAuthConfigurationProblem()
      : null;

  if (!developmentDetails) return null;

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

function accountRequestFailed() {
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
