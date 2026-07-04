import { NextResponse } from "next/server";
import { authCookieName, getAuthCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName, "", {
    ...getAuthCookieOptions(req),
    maxAge: 0,
  });

  return response;
}
