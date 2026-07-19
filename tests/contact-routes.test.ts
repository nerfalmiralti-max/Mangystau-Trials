import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  contactFindUnique: vi.fn(),
  contactCreate: vi.fn(),
  contactUpdate: vi.fn(),
  touristFindUnique: vi.fn(),
  createTransport: vi.fn(),
  sendMail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: {
      findUnique: mocks.contactFindUnique,
      create: mocks.contactCreate,
      update: mocks.contactUpdate,
    },
    tourist: {
      findUnique: mocks.touristFindUnique,
    },
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mocks.createTransport,
  },
}));

import { POST as submitContact } from "@/app/api/contact/route";
import { authCookieName, createSessionToken } from "@/lib/auth";

const databaseUrl = "postgresql://test:test@localhost:5432/contact_test";
const authSecret = "contact-tests-use-a-secret-longer-than-thirty-two-characters";
const smtpEnvironment = [
  "CONTACT_EMAIL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_SECURE",
  "SMTP_FROM",
] as const;

let sequence = 0;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DATABASE_URL", databaseUrl);
  vi.stubEnv("AUTH_SECRET", authSecret);
  for (const key of smtpEnvironment) vi.stubEnv(key, "");

  mocks.contactFindUnique.mockResolvedValue(null);
  mocks.contactCreate.mockResolvedValue({ id: "contact-1" });
  mocks.contactUpdate.mockResolvedValue({ id: "contact-1" });
  mocks.touristFindUnique.mockResolvedValue(null);
  mocks.sendMail.mockResolvedValue({ messageId: "message-1" });
  mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("contact route handler", () => {
  it("persists an anonymous normalized request and returns 201 without SMTP", async () => {
    const response = await submitContact(
      contactRequest({
        name: "  Aruzhan   S. ",
        email: " ARUZHAN@Example.COM ",
        travelWindow: "  April 10–13 ",
        message: "  A quiet route with a local driver.  ",
      })
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      code: "CONTACT_STORED",
    });
    expect(mocks.contactCreate).toHaveBeenCalledWith({
      data: {
        name: "Aruzhan S.",
        email: "aruzhan@example.com",
        travelWindow: "April 10–13",
        message: "A quiet route with a local driver.",
        submissionId: expect.stringMatching(/^contact-request-/),
        touristId: null,
        status: "stored",
      },
      select: { id: true },
    });
    expect(mocks.touristFindUnique).not.toHaveBeenCalled();
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("links a persisted request to an authenticated tourist", async () => {
    mocks.touristFindUnique.mockResolvedValue({ id: "tourist-1" });
    const token = createSessionToken({
      id: "tourist-1",
      email: "aruzhan@example.com",
      name: "Aruzhan",
    });

    const response = await submitContact(
      contactRequest({}, { cookie: `${authCookieName}=${token}` })
    );

    expect(response.status).toBe(201);
    expect(mocks.touristFindUnique).toHaveBeenCalledWith({
      where: { id: "tourist-1" },
      select: { id: true },
    });
    expect(mocks.contactCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ touristId: "tourist-1" }),
      })
    );
  });

  it("returns normalized field errors with 400 and does not access Prisma", async () => {
    const response = await submitContact(
      contactRequest({
        email: "not-an-email",
        travelWindow: " ",
        message: "too short",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      code: "INVALID_CONTACT_REQUEST",
      retryable: false,
      fieldErrors: {
        email: expect.any(String),
        travelWindow: expect.any(String),
        message: expect.any(String),
      },
    });
    expect(mocks.contactFindUnique).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await submitContact(
      rawContactRequest("{", { ip: nextIp("malformed") })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "INVALID_CONTACT_REQUEST",
      retryable: false,
    });
    expect(mocks.contactFindUnique).not.toHaveBeenCalled();
  });

  it("returns 400 for a syntactically valid null body", async () => {
    const response = await submitContact(rawContactRequest("null", { ip: nextIp("null-body") }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "INVALID_CONTACT_REQUEST",
      retryable: false,
    });
    expect(mocks.contactFindUnique).not.toHaveBeenCalled();
  });

  it("rejects a request body above the contact limit", async () => {
    const response = await submitContact(
      rawContactRequest(
        JSON.stringify({
          ...validContactBody("large-contact-request"),
          message: "x".repeat(9_000),
        }),
        { ip: nextIp("large-body") }
      )
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "CONTACT_REQUEST_TOO_LARGE",
      retryable: false,
    });
    expect(mocks.contactFindUnique).not.toHaveBeenCalled();
  });

  it("returns 500 and never starts SMTP when database persistence fails", async () => {
    configureSmtp();
    mocks.contactCreate.mockRejectedValue(new Error("database unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await submitContact(contactRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "CONTACT_SAVE_FAILED",
      retryable: true,
    });
    expect(mocks.createTransport).not.toHaveBeenCalled();
    expect(mocks.sendMail).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "Contact request operation failed",
      expect.objectContaining({ stage: "save" })
    );
  });

  it("returns 503 without touching Prisma when database storage is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");

    const response = await submitContact(contactRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "CONTACT_UNAVAILABLE",
      retryable: true,
    });
    expect(mocks.contactFindUnique).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("rate limits the sixth request from the same address", async () => {
    const ip = nextIp("rate-limit");
    mocks.contactFindUnique.mockResolvedValue(storedContact());
    const responses = [];

    for (let attempt = 0; attempt < 6; attempt += 1) {
      responses.push(
        await submitContact(contactRequest({}, { ip, requestId: `rate-limit-request-${attempt}` }))
      );
    }

    expect(responses.slice(0, 5).map((response) => response.status)).toEqual([
      200, 200, 200, 200, 200,
    ]);
    expect(responses[5].status).toBe(429);
    expect(responses[5].headers.get("Retry-After")).toMatch(/^\d+$/);
    await expect(responses[5].json()).resolves.toMatchObject({
      code: "RATE_LIMITED",
      retryAfter: expect.any(Number),
    });
    expect(mocks.contactFindUnique).toHaveBeenCalledTimes(5);
    expect(mocks.contactCreate).not.toHaveBeenCalled();
  });

  it("returns the existing result for an idempotent duplicate without resending", async () => {
    mocks.contactFindUnique.mockResolvedValue(storedContact());

    const response = await submitContact(
      contactRequest({}, { requestId: "existing-contact-request" })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      code: "CONTACT_ALREADY_STORED",
    });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.touristFindUnique).not.toHaveBeenCalled();
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("treats a concurrent unique-key race as the same idempotent result", async () => {
    mocks.contactCreate.mockRejectedValue({ code: "P2002" });
    mocks.contactFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(storedContact());

    const response = await submitContact(
      contactRequest({}, { requestId: "concurrent-contact-request" })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      code: "CONTACT_ALREADY_STORED",
    });
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("rejects a reused request id when the normalized payload changed", async () => {
    mocks.contactFindUnique.mockResolvedValue(storedContact());

    const response = await submitContact(
      contactRequest(
        { message: "A different route request that must not be acknowledged as the old one." },
        { requestId: "existing-contact-request" }
      )
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "CONTACT_REQUEST_CONFLICT",
      retryable: true,
      resetRequestId: true,
    });
    expect(mocks.contactCreate).not.toHaveBeenCalled();
    expect(mocks.createTransport).not.toHaveBeenCalled();
  });

  it("rejects a cross-site mutation before validation or persistence", async () => {
    const response = await submitContact(
      contactRequest(
        {},
        {
          origin: "https://attacker.example",
          fetchSite: "cross-site",
        }
      )
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ code: "INVALID_ORIGIN" });
    expect(mocks.contactFindUnique).not.toHaveBeenCalled();
    expect(mocks.contactCreate).not.toHaveBeenCalled();
  });

  it("keeps the saved request successful when SMTP delivery fails", async () => {
    configureSmtp();
    mocks.sendMail.mockRejectedValue(new Error("smtp unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await submitContact(contactRequest());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      code: "CONTACT_STORED",
    });
    expect(mocks.contactCreate).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.contactUpdate).toHaveBeenCalledWith({
      where: { id: "contact-1" },
      data: { status: "email_failed" },
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Contact request operation failed",
      expect.objectContaining({ stage: "email" })
    );
  });

  it("keeps the saved request successful when SMTP transport creation throws", async () => {
    configureSmtp();
    mocks.createTransport.mockImplementation(() => {
      throw new Error("transport setup failed");
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await submitContact(contactRequest());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ ok: true, code: "CONTACT_STORED" });
    expect(mocks.contactUpdate).toHaveBeenCalledWith({
      where: { id: "contact-1" },
      data: { status: "email_failed" },
    });
  });

  it("notifies only the configured team address after storage succeeds", async () => {
    configureSmtp();

    const response = await submitContact(contactRequest());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      code: "CONTACT_STORED_AND_NOTIFIED",
    });
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "team@example.com",
        replyTo: { name: "Aruzhan", address: "aruzhan@example.com" },
      })
    );
    expect(mocks.contactUpdate).toHaveBeenCalledWith({
      where: { id: "contact-1" },
      data: { status: "sent" },
    });
  });
});

function validContactBody(requestId = nextRequestId()) {
  return {
    name: "Aruzhan",
    email: "aruzhan@example.com",
    travelWindow: "April 10–13",
    message: "A quiet three-day route with a local driver.",
    company: "",
    requestId,
  };
}

function storedContact() {
  return {
    id: "existing-contact",
    name: "Aruzhan",
    email: "aruzhan@example.com",
    travelWindow: "April 10–13",
    message: "A quiet three-day route with a local driver.",
  };
}

function contactRequest(
  overrides: Record<string, unknown> = {},
  options: {
    cookie?: string;
    fetchSite?: string;
    ip?: string;
    origin?: string;
    requestId?: string;
  } = {}
) {
  const body = {
    ...validContactBody(options.requestId),
    ...overrides,
  };
  const headers = new Headers({
    "Content-Type": "application/json",
    Origin: options.origin ?? "http://localhost",
    "X-Forwarded-For": options.ip ?? nextIp("contact"),
  });
  if (options.cookie) headers.set("Cookie", options.cookie);
  if (options.fetchSite) headers.set("Sec-Fetch-Site", options.fetchSite);

  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function rawContactRequest(body: string, options: { ip: string }) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
      "X-Forwarded-For": options.ip,
    },
    body,
  });
}

function configureSmtp() {
  vi.stubEnv("CONTACT_EMAIL", "team@example.com");
  vi.stubEnv("SMTP_HOST", "smtp.example.com");
  vi.stubEnv("SMTP_PORT", "587");
  vi.stubEnv("SMTP_USER", "mailer@example.com");
  vi.stubEnv("SMTP_PASS", "smtp-password");
  vi.stubEnv("SMTP_SECURE", "false");
  vi.stubEnv("SMTP_FROM", "mailer@example.com");
}

function nextRequestId() {
  sequence += 1;
  return `contact-request-${sequence.toString().padStart(6, "0")}`;
}

function nextIp(label: string) {
  sequence += 1;
  return `${label}-${sequence}`;
}
