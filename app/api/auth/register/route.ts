import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authCookieName,
  authCookieOptions,
  createSessionToken,
  hashPassword,
  normalizeEmail,
} from "@/lib/auth";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  country?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as RegisterBody;
  const name = body.name?.trim();
  const email = normalizeEmail(body.email || "");
  const password = body.password || "";
  const country = body.country?.trim();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 }
    );
  }

  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "Use a valid email and a password with at least 8 characters." },
      { status: 400 }
    );
  }

  try {
    const existingTourist = await prisma.tourist.findUnique({ where: { email } });
    if (existingTourist) {
      return NextResponse.json(
        { error: "A tourist account with this email already exists." },
        { status: 409 }
      );
    }

    const tourist = await prisma.tourist.create({
      data: {
        name,
        email,
        country: country || null,
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

    const response = NextResponse.json({ tourist });
    response.cookies.set(
      authCookieName,
      createSessionToken({ id: tourist.id, email: tourist.email || email, name: tourist.name }),
      authCookieOptions
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "Database is not configured for this deployment yet." },
      { status: 503 }
    );
  }
}
