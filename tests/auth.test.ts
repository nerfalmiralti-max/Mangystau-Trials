import { afterEach, describe, expect, it, vi } from "vitest";

import {
  authCookieName,
  createSessionToken,
  getAuthConfigurationProblem,
  getCookieValue,
  hashPassword,
  readSessionToken,
  verifyPassword,
} from "@/lib/auth";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("password hashing", () => {
  it("uses a per-password salt and verifies only the original password", () => {
    const first = hashPassword("a-long-password");
    const second = hashPassword("a-long-password");

    expect(first).not.toBe("a-long-password");
    expect(first).not.toBe(second);
    expect(verifyPassword("a-long-password", first)).toBe(true);
    expect(verifyPassword("wrong-password", first)).toBe(false);
  });

  it.each([undefined, null, "", "missing-delimiter", "salt:not-hex"])(
    "rejects a malformed stored hash: %p",
    (storedHash) => {
      expect(verifyPassword("password", storedHash)).toBe(false);
    }
  );
});

describe("signed sessions", () => {
  it("round-trips an authenticated tourist", () => {
    vi.stubEnv("AUTH_SECRET", "test-secret-that-is-long-enough-for-session-signing");
    const token = createSessionToken({
      id: "tourist-1",
      email: "traveller@example.com",
      name: "Traveller",
    });

    expect(readSessionToken(token)).toMatchObject({
      id: "tourist-1",
      email: "traveller@example.com",
      name: "Traveller",
    });
  });

  it("rejects payload, signature, and segment tampering", () => {
    vi.stubEnv("AUTH_SECRET", "test-secret-that-is-long-enough-for-session-signing");
    const token = createSessionToken({ id: "tourist-1", email: "traveller@example.com" });
    const [payload, signature] = token.split(".");

    expect(readSessionToken(`${payload}x.${signature}`)).toBeNull();
    expect(readSessionToken(`${payload}.${signature}x`)).toBeNull();
    expect(readSessionToken(`${token}.extra`)).toBeNull();
    expect(readSessionToken("not-a-token")).toBeNull();
  });

  it("rejects an expired session", () => {
    vi.stubEnv("AUTH_SECRET", "test-secret-that-is-long-enough-for-session-signing");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = createSessionToken({ id: "tourist-1", email: "traveller@example.com" });

    vi.setSystemTime(new Date("2026-01-09T00:00:00Z"));
    expect(readSessionToken(token)).toBeNull();
  });
});

describe("auth configuration and cookie parsing", () => {
  it("reports missing, weak, example, and valid production secrets", () => {
    vi.stubEnv("AUTH_SECRET", "");
    expect(getAuthConfigurationProblem()).toBe("AUTH_SECRET is missing.");

    vi.stubEnv("AUTH_SECRET", "too-short");
    expect(getAuthConfigurationProblem()).toContain("at least 32 characters");

    vi.stubEnv("AUTH_SECRET", "replace-with-a-real-production-secret-value");
    expect(getAuthConfigurationProblem()).toContain("example value");

    vi.stubEnv("AUTH_SECRET", "a-random-production-secret-with-more-than-32-characters");
    expect(getAuthConfigurationProblem()).toBeNull();
  });

  it("reads only the exact session cookie", () => {
    const header = `theme=dark; ${authCookieName}=signed-token; ${authCookieName}_old=wrong`;

    expect(getCookieValue(header, authCookieName)).toBe("signed-token");
    expect(getCookieValue(null, authCookieName)).toBeNull();
  });
});
