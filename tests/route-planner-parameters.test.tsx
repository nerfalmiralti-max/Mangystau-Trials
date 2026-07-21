/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/routes",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
  },
}));
vi.mock("@/components/ToastProvider", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("@/components/useStoredIds", () => ({
  useStoredIds: () => [],
  writeStoredIds: vi.fn(),
}));
vi.mock("@/hooks/useSettings", () => ({
  useSettings: () => ({
    tx: (key: string, values?: Record<string, string | number>) =>
      Object.entries(values ?? {}).reduce(
        (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
        key
      ),
    translate: (value: string) => value,
    formatNumber: (value: number) => String(value),
  }),
}));

import RoutePlanner from "@/components/RoutePlanner";

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({ matches: true }),
  });
  window.history.replaceState(null, "", "/routes");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RoutePlanner additional parameters", () => {
  it("opens on the first activation and keeps values through close and reopen", async () => {
    const user = userEvent.setup();
    render(<RoutePlanner />);

    await user.click(screen.getByRole("button", { name: /Destination/ }));
    const toggle = screen.getByRole("button", { name: /Additional parameters/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    toggle.focus();
    await user.keyboard("{Enter}");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    await user.click(screen.getByRole("checkbox", { name: /Avoid the roughest tracks/ }));
    await user.click(screen.getByRole("button", { name: "Sunrise" }));
    await user.selectOptions(screen.getByLabelText("Overnight style"), "guesthouse");
    expect(screen.getByText(/3 selected/)).toBeTruthy();

    await user.click(toggle);
    await user.click(toggle);
    expect((screen.getByRole("checkbox", { name: /Avoid the roughest tracks/ }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("Overnight style") as HTMLSelectElement).value).toBe("guesthouse");

    await user.click(screen.getByRole("button", { name: "Create my route" }));
    expect(window.location.search).toContain("plan=mt-route%3Av2");
    expect(window.location.search).toContain("safe%3Asunrise%3Aguesthouse");
  });
});
