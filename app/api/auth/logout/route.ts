import { NextResponse } from "next/server";
import { authCookieName, getAuthCookieOptions } from "@/lib/auth";
import { enforceRateLimit, rejectCrossSiteMutation } from "@/lib/apiSecurity";

export async function POST(request: Request) {
  const rejected = rejectCrossSiteMutation(request);
  if (rejected) return rejected;
  const limited = enforceRateLimit(request, {
    namespace: "auth-logout",
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  return response;
}
