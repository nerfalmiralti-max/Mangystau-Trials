import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export type TouristSession = {
  id: string;
  email: string;
  name?: string | null;
  exp: number;
};

export const authCookieName = "mangystautrails_session";

const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;
const passwordKeyLength = 64;

export function isAuthConfigured() {
  return process.env.NODE_ENV !== "production" || Boolean(process.env.AUTH_SECRET?.trim());
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "mangystautrails-development-only-secret";
  }

  throw new Error("AUTH_SECRET must be configured in production.");
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(value: string) {
  return toBase64Url(createHmac("sha256", getAuthSecret()).update(value).digest());
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, passwordKeyLength).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) return false;

  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;

  const candidate = scryptSync(password, salt, passwordKeyLength);
  const original = Buffer.from(originalHash, "hex");

  return original.length === candidate.length && timingSafeEqual(original, candidate);
}

export function createSessionToken(session: Omit<TouristSession, "exp">) {
  const payload: TouristSession = {
    ...session,
    exp: Date.now() + sessionMaxAgeSeconds * 1000,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function readSessionToken(token?: string | null) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as TouristSession;
    if (!payload.id || !payload.email || payload.exp <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getCookieValue(cookieHeader: string | null, name: string) {
  return (
    cookieHeader
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? null
  );
}

export function readRequestSession(req: Request) {
  return readSessionToken(getCookieValue(req.headers.get("cookie"), authCookieName));
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const configuredAdmins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  return configuredAdmins.includes(normalizeEmail(email));
}

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionMaxAgeSeconds,
};

export function getAuthCookieOptions() {
  return authCookieOptions;
}
