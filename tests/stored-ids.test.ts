import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  moveGuestStoredIdsToOwner,
  readStoredIds,
  setStoredIdsOwner,
  writeStoredIds,
} from "@/components/useStoredIds";
import {
  LOCATION_FAVORITES_KEY,
  SAVED_HOTELS_KEY,
  SAVED_ROUTES_KEY,
} from "@/lib/appStorage";

beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: createMemoryStorage(),
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("account-scoped saved content", () => {
  it("imports guest saves once and keeps different accounts isolated", () => {
    writeStoredIds(LOCATION_FAVORITES_KEY, ["bozzhyra"]);
    writeStoredIds(SAVED_HOTELS_KEY, ["renaissance-aktau"]);
    writeStoredIds(SAVED_ROUTES_KEY, ["weekend:nature"]);

    expect(moveGuestStoredIdsToOwner("tourist-a")).toBe(true);
    expect(readStoredIds(LOCATION_FAVORITES_KEY)).toEqual(["bozzhyra"]);
    expect(readStoredIds(SAVED_HOTELS_KEY)).toEqual(["renaissance-aktau"]);

    writeStoredIds(LOCATION_FAVORITES_KEY, ["torysh", "bozzhyra"]);
    setStoredIdsOwner("tourist-b");
    expect(readStoredIds(LOCATION_FAVORITES_KEY)).toEqual([]);
    expect(readStoredIds(SAVED_HOTELS_KEY)).toEqual([]);

    writeStoredIds(LOCATION_FAVORITES_KEY, ["beket-ata"]);
    setStoredIdsOwner("tourist-a");
    expect(readStoredIds(LOCATION_FAVORITES_KEY)).toEqual(["torysh", "bozzhyra"]);

    setStoredIdsOwner("tourist-b");
    expect(readStoredIds(LOCATION_FAVORITES_KEY)).toEqual(["beket-ata"]);

    setStoredIdsOwner(null);
    expect(readStoredIds(LOCATION_FAVORITES_KEY)).toEqual([]);
    expect(readStoredIds(SAVED_ROUTES_KEY)).toEqual([]);
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}
