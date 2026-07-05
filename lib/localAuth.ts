import { LOCAL_AUTH_SESSION_KEY, LOCAL_AUTH_USERS_KEY } from "@/lib/appStorage";

export type LocalAuthUser = {
  id: string;
  name: string;
  email: string;
  country: string;
  password: string;
  createdAt: string;
};

export type LocalAuthProfile = {
  id: string;
  name: string | null;
  email: string | null;
  country: string | null;
  createdAt: string;
  visits: [];
};

export type LocalAuthForm = {
  name: string;
  email: string;
  password: string;
  country: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function signUpLocal(form: LocalAuthForm) {
  const email = normalizeEmail(form.email);
  const password = form.password;
  const name = form.name.trim();
  const country = form.country.trim();

  if (!name || !email || !password) {
    return { error: "Name, email and password are required." };
  }

  const validationError = validateEmailPassword(email, password);
  if (validationError) {
    return { error: validationError };
  }

  const users = readLocalUsers();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return { error: "A tourist account with this email already exists." };
  }

  const user: LocalAuthUser = {
    id: createLocalId(),
    name,
    email,
    country,
    password,
    createdAt: new Date().toISOString(),
  };

  writeLocalUsers([user, ...users]);
  writeLocalSession(user.id);

  return { tourist: toLocalAuthProfile(user) };
}

export function loginLocal(form: LocalAuthForm) {
  const email = normalizeEmail(form.email);
  const password = form.password;
  const validationError = validateEmailPassword(email, password);

  if (validationError) {
    return { error: validationError };
  }

  const user = readLocalUsers().find((item) => item.email === email && item.password === password);

  if (!user) {
    return { error: "Incorrect email or password." };
  }

  writeLocalSession(user.id);

  return { tourist: toLocalAuthProfile(user) };
}

export function readLocalSession() {
  const sessionUserId = window.localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
  const user = readLocalUsers().find((item) => item.id === sessionUserId);

  return user ? toLocalAuthProfile(user) : null;
}

export function clearLocalSession() {
  window.localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
}

function validateEmailPassword(email: string, password: string) {
  if (!email || !password || !emailPattern.test(email)) {
    return "Use a valid email and password.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return "";
}

function writeLocalSession(userId: string) {
  window.localStorage.setItem(LOCAL_AUTH_SESSION_KEY, userId);
}

function readLocalUsers() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_AUTH_USERS_KEY) ?? "[]");

    return Array.isArray(parsed)
      ? parsed.filter((item): item is LocalAuthUser => isLocalAuthUser(item))
      : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users: LocalAuthUser[]) {
  window.localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users.slice(0, 20)));
}

function isLocalAuthUser(value: unknown): value is LocalAuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<LocalAuthUser>;
  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.password === "string" &&
    typeof user.createdAt === "string"
  );
}

function toLocalAuthProfile(user: LocalAuthUser): LocalAuthProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    country: user.country || null,
    createdAt: user.createdAt,
    visits: [],
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
