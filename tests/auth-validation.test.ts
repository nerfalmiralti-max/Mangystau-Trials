import { describe, expect, it } from "vitest";

import {
  AUTH_EMAIL_MAX_LENGTH,
  AUTH_NAME_MAX_LENGTH,
  AUTH_PASSWORD_MAX_LENGTH,
  getSafeAuthRedirect,
  readAuthFormMode,
  validateAuthForm,
  validateLoginCredentials,
  validateRegistrationCredentials,
} from "@/lib/authValidation";

describe("auth form mode", () => {
  it("accepts only the explicit register mode", () => {
    expect(readAuthFormMode("register")).toBe("register");
    expect(readAuthFormMode("login")).toBe("login");
    expect(readAuthFormMode("REGISTER")).toBe("login");
    expect(readAuthFormMode(null)).toBe("login");
  });
});

describe("login validation", () => {
  it("normalizes a valid email without changing the password", () => {
    expect(
      validateLoginCredentials({
        email: "  Traveller@Example.COM ",
        password: "correct horse battery staple",
      })
    ).toEqual({
      ok: true,
      data: {
        email: "traveller@example.com",
        password: "correct horse battery staple",
      },
      errors: {},
    });
  });

  it.each([null, undefined, [], "not-an-object", 42])(
    "rejects malformed input without throwing: %p",
    (input) => {
      const result = validateLoginCredentials(input);

      expect(result.ok).toBe(false);
      expect(result.errors).toMatchObject({
        email: "Enter your email address.",
        password: "Enter your password.",
      });
    }
  );

  it("rejects invalid email and password boundaries", () => {
    const result = validateLoginCredentials({
      email: `${"a".repeat(AUTH_EMAIL_MAX_LENGTH)}@example.com`,
      password: "x".repeat(AUTH_PASSWORD_MAX_LENGTH + 1),
    });

    expect(result).toEqual({
      ok: false,
      data: null,
      errors: {
        email: "Enter a valid email address.",
        password: `Use ${AUTH_PASSWORD_MAX_LENGTH} characters or fewer.`,
      },
    });
  });
});

describe("registration validation", () => {
  const validRegistration = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("normalizes name and email and does not retain confirmation", () => {
    const result = validateRegistrationCredentials(
      {
        ...validRegistration,
        name: "  Ada    Lovelace  ",
        email: " ADA@EXAMPLE.COM ",
      },
      { requireConfirmation: true }
    );

    expect(result).toEqual({
      ok: true,
      data: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "password123",
      },
      errors: {},
    });
  });

  it("requires password confirmation in registration form mode", () => {
    const missing = validateAuthForm("register", {
      ...validRegistration,
      confirmPassword: "",
    });
    const mismatched = validateAuthForm("register", {
      ...validRegistration,
      confirmPassword: "different-password",
    });

    expect(missing.errors.confirmPassword).toBe("Confirm your password.");
    expect(mismatched.errors.confirmPassword).toBe("Passwords do not match.");
  });

  it("does not require confirmation for the server registration payload", () => {
    const result = validateRegistrationCredentials({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects missing, wrongly typed, and oversized fields", () => {
    const malformed = validateRegistrationCredentials(
      { name: 123, email: {}, password: [], confirmPassword: false },
      { requireConfirmation: true }
    );
    const oversized = validateRegistrationCredentials({
      name: "x".repeat(AUTH_NAME_MAX_LENGTH + 1),
      email: "valid@example.com",
      password: "password123",
    });

    expect(malformed.ok).toBe(false);
    expect(malformed.errors).toMatchObject({
      name: "Enter your name.",
      email: "Enter your email address.",
      password: "Enter your password.",
      confirmPassword: "Confirm your password.",
    });
    expect(oversized.errors.name).toBe(`Use ${AUTH_NAME_MAX_LENGTH} characters or fewer.`);
  });
});

describe("safe post-auth redirects", () => {
  it.each([
    ["/saved", "/saved"],
    [" /routes/plan?id=abc#overview ", "/routes/plan?id=abc#overview"],
    ["/profile?mode=login&next=%2Fsaved", "/profile?mode=login&next=%2Fsaved"],
  ])("keeps a same-origin relative target %s", (input, expected) => {
    expect(getSafeAuthRedirect(input)).toBe(expected);
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
    "\\evil.example\\steal",
    "javascript:alert(1)",
    "/safe\nSet-Cookie:bad=true",
    "saved",
    null,
    {},
  ])("falls back for an unsafe or malformed target: %p", (input) => {
    expect(getSafeAuthRedirect(input, "/fallback")).toBe("/fallback");
  });
});
