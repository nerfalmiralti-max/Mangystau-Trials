import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authCookieName,
  authCookieOptions,
  createSessionToken,
  normalizeEmail,
  verifyPassword,
} from "@/lib/auth";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as LoginBody;
  const email = normalizeEmail(body.email || "");
  const password = body.password || "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const tourist = await prisma.tourist.findUnique({ where: { email } });
  if (!tourist || !verifyPassword(password, tourist.passwordHash)) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
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
    },
  });
  response.cookies.set(
    authCookieName,
    createSessionToken({ id: tourist.id, email: tourist.email || email, name: tourist.name }),
    authCookieOptions
  );

  return response;
}
