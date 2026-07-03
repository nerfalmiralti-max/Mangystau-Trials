"use client";

import { useMemo, useSyncExternalStore } from "react";

const STORAGE_EVENT = "nomadgo:stored-ids";

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

  window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids)).slice(0, 12)));
  window.dispatchEvent(new Event(STORAGE_EVENT));
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

  return window.localStorage.getItem(key) ?? "[]";
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
