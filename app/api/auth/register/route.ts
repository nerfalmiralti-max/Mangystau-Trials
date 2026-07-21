import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  authCookieName,
  createSessionToken,
  getAuthConfigurationProblem,
  getAuthCookieOptions,
  hashPassword,
} from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";
import { validateRegistrationCredentials } from "@/lib/authValidation";

export async function POST(req: Request) {
  const rejected = rejectCrossSiteMutation(req);
  if (rejected) return rejected;

  const configurationError = getAccountConfigurationError();
  if (configurationError) return configurationError;

  const validation = validateRegistrationCredentials(await req.json().catch(() => null));

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Check the highlighted account fields.",
        code: "INVALID_INPUT",
        fieldErrors: validation.errors,
      },
      { status: 400 }
    );
  }

  const { name, email, password } = validation.data;
  const limited = enforceRateLimit(req, {
    namespace: "auth-register",
    limit: 5,
    windowMs: 15 * 60_000,
    identity: email,
  });
  if (limited) return limited;

  try {
    const { prisma } = await import("@/lib/prisma");
    const existingTourist = await prisma.tourist.findUnique({ where: { email } });
    if (existingTourist) {
      return NextResponse.json(
        { error: "An account with this email already exists.", code: "ACCOUNT_EXISTS" },
        { status: 409 }
      );
    }

    const tourist = await prisma.tourist.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        createdAt: true,
      },
    });

    const response = NextResponse.json({
      tourist: { ...tourist, savedLocations: [], savedRoutes: [] },
    });
    response.cookies.set(
      authCookieName,
      createSessionToken({ id: tourist.id, email: tourist.email || email, name: tourist.name }),
      getAuthCookieOptions()
    );

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
          code: "ACCOUNT_EXISTS",
        },
        { status: 409 }
      );
    }
    console.error("Registration failed", error);
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
