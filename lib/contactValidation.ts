export const CONTACT_LIMITS = {
  name: 80,
  email: 254,
  travelWindow: 120,
  message: 4000,
  requestId: 80,
  honeypot: 120,
} as const;

export type ContactField = "name" | "email" | "travelWindow" | "message";
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export type ContactInput = {
  name?: unknown;
  email?: unknown;
  travelWindow?: unknown;
  message?: unknown;
  company?: unknown;
  requestId?: unknown;
};

export type ValidContactInput = {
  name: string;
  email: string;
  travelWindow: string;
  message: string;
  company: string;
  requestId: string;
};

export type ContactValidationResult =
  | { ok: true; data: ValidContactInput; errors: ContactFieldErrors; formError: null }
  | { ok: false; data: null; errors: ContactFieldErrors; formError: string | null };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestIdPattern = /^[A-Za-z0-9_-]{16,80}$/;

export function normalizeContactEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isContactRequestId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= CONTACT_LIMITS.requestId &&
    requestIdPattern.test(value)
  );
}

export function validateContactInput(input: unknown): ContactValidationResult {
  const values = readRecord(input);
  const rawName = readText(values.name);
  const rawEmail = readText(values.email);
  const rawTravelWindow = readText(values.travelWindow);
  const rawMessage = readText(values.message);
  const rawCompany = readText(values.company);
  const rawRequestId = readText(values.requestId);

  const name = normalizeSingleLine(rawName);
  const email = normalizeContactEmail(normalizeSingleLine(rawEmail));
  const travelWindow = normalizeSingleLine(rawTravelWindow);
  const message = normalizeMessage(rawMessage);
  const company = normalizeSingleLine(rawCompany);
  const requestId = normalizeSingleLine(rawRequestId);
  const errors: ContactFieldErrors = {};

  if (!name) {
    errors.name = "Enter your name.";
  } else if (rawName.length > CONTACT_LIMITS.name || name.length > CONTACT_LIMITS.name) {
    errors.name = `Use ${CONTACT_LIMITS.name} characters or fewer.`;
  }

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (
    rawEmail.length > CONTACT_LIMITS.email ||
    email.length > CONTACT_LIMITS.email ||
    !emailPattern.test(email)
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!travelWindow) {
    errors.travelWindow = "Add a travel window, even if your dates are flexible.";
  } else if (
    rawTravelWindow.length > CONTACT_LIMITS.travelWindow ||
    travelWindow.length > CONTACT_LIMITS.travelWindow
  ) {
    errors.travelWindow = `Use ${CONTACT_LIMITS.travelWindow} characters or fewer.`;
  }

  if (!message) {
    errors.message = "Tell us a little about the route you have in mind.";
  } else if (message.length < 12) {
    errors.message = "Add at least 12 characters about your trip.";
  } else if (rawMessage.length > CONTACT_LIMITS.message || message.length > CONTACT_LIMITS.message) {
    errors.message = `Use ${CONTACT_LIMITS.message.toLocaleString("en-US")} characters or fewer.`;
  }

  const hasInvalidHoneypot = company.length > 0 || rawCompany.length > CONTACT_LIMITS.honeypot;
  const hasInvalidRequestId =
    rawRequestId.length > CONTACT_LIMITS.requestId || !requestIdPattern.test(requestId);
  const formError = hasInvalidHoneypot
    ? "This request could not be verified."
    : hasInvalidRequestId
      ? "Refresh the page and try again."
      : null;

  if (Object.keys(errors).length > 0 || formError) {
    return { ok: false, data: null, errors, formError };
  }

  return {
    ok: true,
    data: { name, email, travelWindow, message, company, requestId },
    errors,
    formError: null,
  };
}

function readText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readRecord(value: unknown): ContactInput {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as ContactInput)
    : {};
}

function normalizeSingleLine(value: string) {
  return value.replace(/\0/g, "").replace(/[\r\n]+/g, " ").trim().replace(/\s+/g, " ");
}

function normalizeMessage(value: string) {
  return value.replace(/\0/g, "").replace(/\r\n?/g, "\n").trim();
}
