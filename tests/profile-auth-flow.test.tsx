/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  search: new URLSearchParams("mode=login"),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
  useSearchParams: () => mocks.search,
}));

vi.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: { children: ReactNode }) => (
      <section {...props}>{children}</section>
    ),
  },
}));

vi.mock("@/components/AnimatedHero", () => ({ default: () => null }));
vi.mock("@/components/AnimatedTitle", () => ({
  default: ({ text }: { text: string }) => <h1>{text}</h1>,
}));
vi.mock("@/components/useStoredIds", () => ({
  useStoredIds: () => [],
  readStoredIds: () => [],
  writeStoredIds: vi.fn(),
  moveGuestStoredIdsToOwner: () => true,
  setStoredIdsOwner: vi.fn(),
}));
vi.mock("@/hooks/useSettings", () => ({
  useSettings: () => ({
    t: (key: string) => ({
      "auth.login": "Log in",
      "auth.signup": "Sign up",
      "profile.email": "Email",
      "profile.password": "Password",
      "profile.welcomeBack": "Welcome back",
      "profile.newTraveler": "New traveler",
      "profile.touristName": "Tourist name",
      "profile.loginTitle": "Log in to your route space",
      "profile.loginCopy": "Login copy",
      "profile.signupTitle": "Sign up for smarter trips",
      "profile.signupCopy": "Signup copy",
    })[key] ?? key,
    tx: (key: string, values?: Record<string, string | number>) =>
      Object.entries(values ?? {}).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        key
      ),
  }),
}));

import ProfileClient from "@/components/ProfileClient";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = new URLSearchParams("mode=login");
  window.sessionStorage.clear();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ProfileClient authentication flow", () => {
  it("rejects a malformed email inline without an authentication request", async () => {
    useAnonymousSession();
    const user = userEvent.setup();
    render(<ProfileClient />);
    await waitForSessionCheck();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "secure-password");
    const form = getSubmitButton().closest("form");
    fireEvent.submit(form!);

    expect(await screen.findByText("Enter a valid email address.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Email"));
    expect(authCalls()).toHaveLength(0);
  });

  it("offers sign-up after invalid credentials and preserves the entered email", async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === "/api/auth/me") {
        return Promise.resolve(jsonResponse(401, { tourist: null }));
      }
      if (String(input) === "/api/auth/login") {
        return Promise.resolve(
          jsonResponse(401, {
            code: "INVALID_CREDENTIALS",
            error: "server text must not be rendered",
          })
        );
      }
      throw new Error(`Unexpected request: ${String(input)}`);
    });
    const user = userEvent.setup();
    render(<ProfileClient />);
    await waitForSessionCheck();

    await user.type(screen.getByLabelText("Email"), "traveler@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(getSubmitButton());

    expect(await screen.findByText(/couldn.t log you in.*create a new account/i)).toBeTruthy();
    expect(screen.queryByText("server text must not be rendered")).toBeNull();
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "traveler@example.com"
    );

    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(mocks.push).toHaveBeenCalledWith("/profile?mode=register", { scroll: false });
    expect(window.sessionStorage.getItem("mangystau:auth-email")).toBe(
      "traveler@example.com"
    );
  });
});

function useAnonymousSession() {
  fetchMock.mockImplementation((input: RequestInfo | URL) => {
    if (String(input) === "/api/auth/me") {
      return Promise.resolve(jsonResponse(401, { tourist: null }));
    }
    throw new Error(`Unexpected request: ${String(input)}`);
  });
}

async function waitForSessionCheck() {
  await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", expect.anything()));
  await waitFor(() => expect(getSubmitButton().disabled).toBe(false));
}

function getSubmitButton() {
  return screen
    .getAllByRole("button", { name: "Log in" })
    .find((button) => button.getAttribute("type") === "submit") as HTMLButtonElement;
}

function authCalls() {
  return fetchMock.mock.calls.filter((call) => String(call[0]).startsWith("/api/auth/login"));
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
