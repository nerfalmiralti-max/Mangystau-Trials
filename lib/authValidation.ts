export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 128;
export const AUTH_NAME_MAX_LENGTH = 80;
export const AUTH_EMAIL_MAX_LENGTH = 254;

export type AuthFormMode = "login" | "register";
export type AuthField = "name" | "email" | "password" | "confirmPassword";
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegistrationCredentials = LoginCredentials & {
  name: string;
};

export type AuthValidationResult<T> =
  | { ok: true; data: T; errors: AuthFieldErrors }
  | { ok: false; data: null; errors: AuthFieldErrors };

type RegistrationValidationOptions = {
  requireConfirmation?: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readAuthFormMode(value: unknown): AuthFormMode {
  return value === "register" ? "register" : "login";
}

export function normalizeAuthEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateLoginCredentials(input: unknown): AuthValidationResult<LoginCredentials> {
  const values = readRecord(input);
  const email = typeof values.email === "string" ? normalizeAuthEmail(values.email) : "";
  const password = typeof values.password === "string" ? values.password : "";
  const errors: AuthFieldErrors = {};

  validateEmail(email, errors);
  validatePassword(password, errors);

  if (Object.keys(errors).length > 0) {
    return { ok: false, data: null, errors };
  }

  return { ok: true, data: { email, password }, errors };
}

export function validateRegistrationCredentials(
  input: unknown,
  options: RegistrationValidationOptions = {}
): AuthValidationResult<RegistrationCredentials> {
  const values = readRecord(input);
  const name = typeof values.name === "string" ? values.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof values.email === "string" ? normalizeAuthEmail(values.email) : "";
  const password = typeof values.password === "string" ? values.password : "";
  const confirmation =
    typeof values.confirmPassword === "string" ? values.confirmPassword : "";
  const errors: AuthFieldErrors = {};

  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > AUTH_NAME_MAX_LENGTH) {
    errors.name = `Use ${AUTH_NAME_MAX_LENGTH} characters or fewer.`;
  }

  validateEmail(email, errors);
  validatePassword(password, errors);

  if (options.requireConfirmation) {
    if (!confirmation) {
      errors.confirmPassword = "Confirm your password.";
    } else if (confirmation !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, data: null, errors };
  }

  return { ok: true, data: { name, email, password }, errors };
}

export function validateAuthForm(mode: AuthFormMode, input: unknown) {
  return mode === "register"
    ? validateRegistrationCredentials(input, { requireConfirmation: true })
    : validateLoginCredentials(input);
}

export function getSafeAuthRedirect(value: unknown, fallback = "/profile") {
  if (typeof value !== "string") return fallback;

  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const base = new URL("https://mangystautrails.invalid");
    const resolved = new URL(candidate, base);
    if (resolved.origin !== base.origin) return fallback;

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

function readRecord(input: unknown): Record<string, unknown> {
  return input !== null && typeof input === "object" && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {};
}

function validateEmail(email: string, errors: AuthFieldErrors) {
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (email.length > AUTH_EMAIL_MAX_LENGTH || !emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }
}

function validatePassword(password: string, errors: AuthFieldErrors) {
  if (!password) {
    errors.password = "Enter your password.";
  } else if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    errors.password = `Use at least ${AUTH_PASSWORD_MIN_LENGTH} characters.`;
  } else if (password.length > AUTH_PASSWORD_MAX_LENGTH) {
    errors.password = `Use ${AUTH_PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
}
