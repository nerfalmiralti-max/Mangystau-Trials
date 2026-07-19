/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  showToast: vi.fn(),
}));

vi.mock("@/components/ToastProvider", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      className,
      role,
      "aria-live": ariaLive,
    }: {
      children: ReactNode;
      className?: string;
      role?: string;
      "aria-live"?: "off" | "assertive" | "polite";
    }) => (
      <div className={className} role={role} aria-live={ariaLive}>
        {children}
      </div>
    ),
  },
}));

import ContactForm from "@/components/ContactForm";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ContactForm", () => {
  it("shows inline validation and focuses the first invalid field without posting", async () => {
    useAnonymousAuth();
    const user = userEvent.setup();
    render(<ContactForm />);
    await waitForAuth();

    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Enter your name.")).toBeTruthy();
    expect(screen.getByText("Enter your email address.")).toBeTruthy();
    expect(screen.getByText("Add a travel window, even if your dates are flexible.")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Name"));
    expect(contactCalls()).toHaveLength(0);
  });

  it("locks rapid submissions, waits for confirmed success, and clears only trip details", async () => {
    let finishContact!: (response: Response) => void;
    const pendingContact = new Promise<Response>((resolve) => {
      finishContact = resolve;
    });
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === "/api/auth/me") return Promise.resolve(jsonResponse(401, { tourist: null }));
      if (String(input) === "/api/contact") return pendingContact;
      throw new Error(`Unexpected request: ${String(input)}`);
    });
    const user = userEvent.setup();
    render(<ContactForm />);
    await waitForAuth();
    await fillValidForm(user);

    const form = screen.getByRole("button", { name: "Send message" }).closest("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);
    fireEvent.submit(form!);

    await waitFor(() => {
      const button = screen.getByRole("button", { name: "Sending…" }) as HTMLButtonElement;
      expect(button.disabled).toBe(true);
      expect(contactCalls()).toHaveLength(1);
    });
    expect(screen.queryByText("Saved by the server")).toBeNull();

    await act(async () => {
      finishContact(
        jsonResponse(201, {
          ok: true,
          code: "CONTACT_STORED",
          message: "Saved by the server",
        })
      );
      await pendingContact;
    });

    await screen.findByText("Saved by the server");
    expect(inputValue("Name")).toBe("Aruzhan");
    expect(inputValue("Email")).toBe("aruzhan@example.com");
    expect(inputValue("Travel window")).toBe("");
    expect(inputValue("Message")).toBe("");
    expect(mocks.showToast).toHaveBeenCalledTimes(1);
  });

  it("treats a malformed 2xx payload as an error and preserves every field", async () => {
    useAnonymousAuth(jsonResponse(200, {}));
    const user = userEvent.setup();
    render(<ContactForm />);
    await waitForAuth();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Send message" }));

    await screen.findByText(/could not verify that your route request was saved/i);
    expect(inputValue("Name")).toBe("Aruzhan");
    expect(inputValue("Email")).toBe("aruzhan@example.com");
    expect(inputValue("Travel window")).toBe("April, three flexible days");
    expect(inputValue("Message")).toBe("A quiet route with a local driver.");
    expect(mocks.showToast).not.toHaveBeenCalled();
  });

  it("reuses the same request id after a retryable server error", async () => {
    const responses = [
      jsonResponse(500, {
        ok: false,
        code: "CONTACT_SAVE_FAILED",
        error: "Storage is temporarily unavailable.",
        retryable: true,
      }),
      jsonResponse(201, {
        ok: true,
        code: "CONTACT_STORED",
        message: "Request stored",
      }),
    ];
    useAnonymousAuth(...responses);
    const user = userEvent.setup();
    render(<ContactForm />);
    await waitForAuth();
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("Storage is temporarily unavailable.");
    expect(inputValue("Message")).toBe("A quiet route with a local driver.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText("Request stored");

    const bodies = contactCalls().map((call) => JSON.parse(String(call[1]?.body)) as { requestId: string });
    expect(bodies).toHaveLength(2);
    expect(bodies[0].requestId).toBe(bodies[1].requestId);
  });

  it("prefills editable identity fields for an authenticated tourist", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        tourist: { id: "tourist-1", name: "Aigul", email: "aigul@example.com" },
      })
    );
    const user = userEvent.setup();
    render(<ContactForm />);

    await waitFor(() => expect(inputValue("Name")).toBe("Aigul"));
    expect(inputValue("Email")).toBe("aigul@example.com");
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Edited name");
    expect(inputValue("Name")).toBe("Edited name");
  });

  it("restores a scoped draft and its id after remount", async () => {
    useAnonymousAuth();
    const user = userEvent.setup();
    const firstRender = render(<ContactForm />);
    await waitForAuth();
    await fillValidForm(user);

    await waitFor(() => {
      expect(window.sessionStorage.getItem("mangystau:contact-draft:guest")).not.toBeNull();
    });
    const savedDraft = JSON.parse(
      window.sessionStorage.getItem("mangystau:contact-draft:guest") ?? "{}"
    ) as { requestId: string };
    firstRender.unmount();

    render(<ContactForm />);
    await waitFor(() => expect(inputValue("Travel window")).toBe("April, three flexible days"));
    fetchMock.mockResolvedValueOnce(
      jsonResponse(201, { ok: true, code: "CONTACT_STORED", message: "Restored request stored" })
    );
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText("Restored request stored");

    const body = JSON.parse(String(contactCalls().at(-1)?.[1]?.body)) as { requestId: string };
    expect(body.requestId).toBe(savedDraft.requestId);
  });
});

function useAnonymousAuth(...contactResponses: Response[]) {
  fetchMock.mockImplementation((input: RequestInfo | URL) => {
    if (String(input) === "/api/auth/me") return Promise.resolve(jsonResponse(401, { tourist: null }));
    if (String(input) === "/api/contact") {
      const response = contactResponses.shift();
      if (!response) throw new Error("No contact response was configured.");
      return Promise.resolve(response);
    }
    throw new Error(`Unexpected request: ${String(input)}`);
  });
}

async function waitForAuth() {
  await waitFor(() => {
    expect(fetchMock.mock.calls.some((call) => String(call[0]) === "/api/auth/me")).toBe(true);
  });
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Aruzhan");
  await user.type(screen.getByLabelText("Email"), "aruzhan@example.com");
  await user.type(screen.getByLabelText("Travel window"), "April, three flexible days");
  await user.type(screen.getByLabelText("Message"), "A quiet route with a local driver.");
}

function inputValue(label: string) {
  return (screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement).value;
}

function contactCalls() {
  return fetchMock.mock.calls.filter((call) => String(call[0]) === "/api/contact");
}

function jsonResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}
