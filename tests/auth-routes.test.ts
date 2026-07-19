import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tourist: {
      findUnique: prismaMocks.findUnique,
      create: prismaMocks.create,
    },
  },
}));

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { POST as register } from "@/app/api/auth/register/route";
import { authCookieName, hashPassword } from "@/lib/auth";

const account = {
  id: "tourist-1",
  name: "Aruzhan",
  email: "aruzhan@example.com",
  country: null,
  createdAt: new Date("2026-07-19T00:00:00.000Z"),
};
let requestCounter = 0;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  vi.stubEnv("AUTH_SECRET", "test-secret-that-is-longer-than-thirty-two-characters");
});

describe("authentication route handlers", () => {
  it("registers a valid account and sets an HTTP-only session", async () => {
    prismaMocks.findUnique.mockResolvedValue(null);
    prismaMocks.create.mockResolvedValue(account);

    const response = await register(
      jsonRequest("/api/auth/register", {
        name: "  Aruzhan  ",
        email: "ARUZHAN@example.com",
        password: "secure-password",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.tourist).toMatchObject({
      id: account.id,
      name: account.name,
      email: account.email,
      savedLocations: [],
      savedRoutes: [],
    });
    expect(prismaMocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Aruzhan", email: account.email }),
      })
    );
    expect(response.headers.get("set-cookie")).toContain(`${authCookieName}=`);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("restores a valid account session with saved content", async () => {
    prismaMocks.findUnique.mockResolvedValue({
      ...account,
      passwordHash: hashPassword("secure-password"),
      savedLocations: [{ locationId: "bozzhyra" }],
      savedRoutes: [{ planId: "saved-plan" }],
    });

    const response = await login(
      jsonRequest("/api/auth/login", {
        email: account.email,
        password: "secure-password",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.tourist.savedLocations).toEqual([{ locationId: "bozzhyra" }]);
    expect(payload.tourist.savedRoutes).toEqual([{ planId: "saved-plan" }]);
    expect(response.headers.get("set-cookie")).toContain(`${authCookieName}=`);
  });

  it("rejects an incorrect password without revealing account existence", async () => {
    prismaMocks.findUnique.mockResolvedValue({
      ...account,
      passwordHash: hashPassword("secure-password"),
      savedLocations: [],
      savedRoutes: [],
    });

    const response = await login(
      jsonRequest("/api/auth/login", {
        email: account.email,
        password: "incorrect-password",
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_CREDENTIALS",
      error: "Incorrect email or password.",
    });
  });

  it("clears the session cookie on logout", async () => {
    const response = await logout(jsonRequest("/api/auth/logout", {}));
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(cookie).toContain(`${authCookieName}=`);
    expect(cookie).toMatch(/Max-Age=0/i);
  });
});

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
      "X-Forwarded-For": `test-${requestCounter++}`,
    },
    body: JSON.stringify(body),
  });
}
