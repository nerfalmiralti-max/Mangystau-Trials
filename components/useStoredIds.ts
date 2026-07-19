"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  ACCOUNT_SCOPED_STORAGE_KEYS,
  LOCATION_FAVORITES_KEY,
  RECENT_PLACES_KEY,
} from "@/lib/appStorage";

const STORAGE_EVENT = "mangystau:stored-ids";
const ACTIVE_OWNER_KEY = "mangystau:active-storage-owner";
const ACCOUNT_ITEM_LIMIT = 100;
const DEVICE_ITEM_LIMIT = 12;
const accountScopedKeys = new Set<string>(ACCOUNT_SCOPED_STORAGE_KEYS);
const LEGACY_KEYS: Record<string, string[]> = {
  [LOCATION_FAVORITES_KEY]: ["mangystau:guide-favorites", "nomadgo:favoritePlaces"],
  [RECENT_PLACES_KEY]: ["nomadgo:recentPlaces"],
};

export function useStoredIds(key: string) {
  const serialized = useSyncExternalStore(
    subscribe,
    () => getStoredValue(key),
    () => "[]"
  );

  return useMemo(() => parseStoredIds(serialized), [serialized]);
}

export function readStoredIds(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  return parseStoredIds(getStoredValue(key));
}

export function writeStoredIds(key: string, ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const ownerId = getActiveOwnerId();
  const storageKey = getResolvedStorageKey(key, ownerId);
  window.localStorage.setItem(storageKey, serializeIds(ids, getItemLimit(key)));

  if (!accountScopedKeys.has(key) || !ownerId) {
    for (const legacyKey of getLegacyStorageKeys(key)) {
      window.localStorage.removeItem(legacyKey);
    }
  }

  dispatchStorageChange();
}

export function setStoredIdsOwner(ownerId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedOwnerId = normalizeOwnerId(ownerId);
  if (normalizedOwnerId) {
    window.localStorage.setItem(ACTIVE_OWNER_KEY, normalizedOwnerId);
  } else {
    window.localStorage.removeItem(ACTIVE_OWNER_KEY);
  }

  dispatchStorageChange();
}

export function moveGuestStoredIdsToOwner(ownerId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const normalizedOwnerId = normalizeOwnerId(ownerId);
  if (!normalizedOwnerId) {
    return false;
  }

  const accountValues = ACCOUNT_SCOPED_STORAGE_KEYS.map((key) => {
    const accountIds = parseStoredIds(
      window.localStorage.getItem(getAccountStorageKey(key, normalizedOwnerId)) ?? "[]"
    );
    const guestIds = readGuestStoredIds(key);

    return {
      key,
      value: serializeIds([...accountIds, ...guestIds], ACCOUNT_ITEM_LIMIT),
    };
  });

  try {
    for (const item of accountValues) {
      window.localStorage.setItem(
        getAccountStorageKey(item.key, normalizedOwnerId),
        item.value
      );
    }
  } catch {
    return false;
  }

  for (const key of ACCOUNT_SCOPED_STORAGE_KEYS) {
    window.localStorage.removeItem(getGuestStorageKey(key));
    window.localStorage.removeItem(key);
    for (const legacyKey of LEGACY_KEYS[key] ?? []) {
      window.localStorage.removeItem(legacyKey);
    }
  }

  window.localStorage.setItem(ACTIVE_OWNER_KEY, normalizedOwnerId);
  dispatchStorageChange();
  return true;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function getStoredValue(key: string) {
  if (typeof window === "undefined") {
    return "[]";
  }

  if (accountScopedKeys.has(key)) {
    const ownerId = getActiveOwnerId();
    if (ownerId) {
      return serializeIds(
        parseStoredIds(window.localStorage.getItem(getAccountStorageKey(key, ownerId)) ?? "[]"),
        ACCOUNT_ITEM_LIMIT
      );
    }

    return serializeIds(readGuestStoredIds(key), ACCOUNT_ITEM_LIMIT);
  }

  const ids = [key, ...(LEGACY_KEYS[key] ?? [])].flatMap((storageKey) =>
    parseStoredIds(window.localStorage.getItem(storageKey) ?? "[]")
  );
  return serializeIds(ids, DEVICE_ITEM_LIMIT);
}

function readGuestStoredIds(key: string) {
  const storageKeys = [
    getGuestStorageKey(key),
    key,
    ...(LEGACY_KEYS[key] ?? []),
  ];

  return Array.from(new Set(storageKeys)).flatMap((storageKey) =>
    parseStoredIds(window.localStorage.getItem(storageKey) ?? "[]")
  );
}

function getResolvedStorageKey(key: string, ownerId: string | null) {
  if (!accountScopedKeys.has(key)) return key;
  return ownerId ? getAccountStorageKey(key, ownerId) : getGuestStorageKey(key);
}

function getAccountStorageKey(key: string, ownerId: string) {
  return `${key}:account:${encodeURIComponent(ownerId)}`;
}

function getGuestStorageKey(key: string) {
  return `${key}:guest`;
}

function getLegacyStorageKeys(key: string) {
  return accountScopedKeys.has(key)
    ? [key, ...(LEGACY_KEYS[key] ?? [])]
    : LEGACY_KEYS[key] ?? [];
}

function getActiveOwnerId() {
  return normalizeOwnerId(window.localStorage.getItem(ACTIVE_OWNER_KEY));
}

function normalizeOwnerId(ownerId: string | null) {
  if (typeof ownerId !== "string") return null;
  const normalized = ownerId.trim();
  return normalized ? normalized.slice(0, 160) : null;
}

function getItemLimit(key: string) {
  return accountScopedKeys.has(key) ? ACCOUNT_ITEM_LIMIT : DEVICE_ITEM_LIMIT;
}

function serializeIds(ids: string[], limit: number) {
  const normalizedIds = ids
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return JSON.stringify(Array.from(new Set(normalizedIds)).slice(0, limit));
}

function dispatchStorageChange() {
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function parseStoredIds(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
