import { describe, expect, it } from "vitest";

import {
  CONTACT_LIMITS,
  normalizeContactEmail,
  validateContactInput,
} from "@/lib/contactValidation";

const minimumValidRequestId = "r".repeat(16);

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    name: "Aruzhan",
    email: "aruzhan@example.com",
    travelWindow: "April 10–13",
    message: "A quiet three-day route with a local driver.",
    company: "",
    requestId: minimumValidRequestId,
    ...overrides,
  };
}

describe("contact input validation", () => {
  it.each([null, undefined, [], "invalid", 42, true])(
    "rejects a malformed payload: %p",
    (input) => {
      const result = validateContactInput(input);

      expect(result).toMatchObject({
        ok: false,
        data: null,
        errors: {
          name: expect.any(String),
          email: expect.any(String),
          travelWindow: expect.any(String),
          message: expect.any(String),
        },
      });
    }
  );

  it("rejects non-string field values instead of coercing them", () => {
    const result = validateContactInput({
      name: 123,
      email: { address: "aruzhan@example.com" },
      travelWindow: false,
      message: ["route details"],
      requestId: minimumValidRequestId,
    });

    expect(result).toMatchObject({
      ok: false,
      errors: {
        name: expect.any(String),
        email: expect.any(String),
        travelWindow: expect.any(String),
        message: expect.any(String),
      },
    });
  });

  it("normalizes email, single-line fields, NUL bytes, and message newlines", () => {
    const result = validateContactInput(
      validInput({
        name: "  \0Aruzhan\r\n   S.  ",
        email: "  ARUZHAN@Example.COM\r\n",
        travelWindow: "  April\n   10–13  ",
        message: "  First route note.\r\nSecond route note.  ",
      })
    );

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Aruzhan S.",
        email: "aruzhan@example.com",
        travelWindow: "April 10–13",
        message: "First route note.\nSecond route note.",
        company: "",
        requestId: minimumValidRequestId,
      },
      errors: {},
      formError: null,
    });
    expect(normalizeContactEmail("  TRAVELER@EXAMPLE.COM ")).toBe(
      "traveler@example.com"
    );
  });

  it("accepts exact upper boundaries without truncating values", () => {
    const emailAtLimit = `${"a".repeat(CONTACT_LIMITS.email - 12)}@example.com`;
    const result = validateContactInput({
      name: "n".repeat(CONTACT_LIMITS.name),
      email: emailAtLimit,
      travelWindow: "t".repeat(CONTACT_LIMITS.travelWindow),
      message: "m".repeat(CONTACT_LIMITS.message),
      company: "",
      requestId: "r".repeat(CONTACT_LIMITS.requestId),
    });

    expect(emailAtLimit).toHaveLength(CONTACT_LIMITS.email);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toHaveLength(CONTACT_LIMITS.name);
      expect(result.data.travelWindow).toHaveLength(CONTACT_LIMITS.travelWindow);
      expect(result.data.message).toHaveLength(CONTACT_LIMITS.message);
      expect(result.data.requestId).toHaveLength(CONTACT_LIMITS.requestId);
    }
  });

  it.each([
    ["name", "n".repeat(CONTACT_LIMITS.name + 1), "name"],
    [
      "email",
      `${"a".repeat(CONTACT_LIMITS.email - 11)}@example.com`,
      "email",
    ],
    [
      "travelWindow",
      "t".repeat(CONTACT_LIMITS.travelWindow + 1),
      "travelWindow",
    ],
    ["message", "m".repeat(CONTACT_LIMITS.message + 1), "message"],
  ] as const)("rejects %s above its maximum length", (field, value, errorField) => {
    const result = validateContactInput(validInput({ [field]: value }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[errorField]).toEqual(expect.any(String));
    }
  });

  it("requires a travel window even when the other fields are valid", () => {
    const result = validateContactInput(validInput({ travelWindow: "   \r\n " }));

    expect(result).toMatchObject({
      ok: false,
      errors: {
        travelWindow: "Add a travel window, even if your dates are flexible.",
      },
    });
  });

  it("enforces the message minimum and request-id boundaries", () => {
    const shortMessage = validateContactInput(validInput({ message: "12345678901" }));
    const shortRequestId = validateContactInput(validInput({ requestId: "r".repeat(15) }));
    const longRequestId = validateContactInput(
      validInput({ requestId: "r".repeat(CONTACT_LIMITS.requestId + 1) })
    );

    expect(shortMessage).toMatchObject({
      ok: false,
      errors: { message: "Add at least 12 characters about your trip." },
    });
    expect(shortRequestId).toMatchObject({
      ok: false,
      formError: "Refresh the page and try again.",
    });
    expect(longRequestId).toMatchObject({
      ok: false,
      formError: "Refresh the page and try again.",
    });
  });

  it("rejects a filled honeypot without exposing it as a field error", () => {
    const result = validateContactInput(validInput({ company: "bot value" }));

    expect(result).toEqual({
      ok: false,
      data: null,
      errors: {},
      formError: "This request could not be verified.",
    });
  });
});
