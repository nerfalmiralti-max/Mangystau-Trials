"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/lib/geo";

export type LocationPermissionStatus = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

const permissionStorageKey = "mangystau-location-permission";
const cachedCoordinatesKey = "mangystau-user-coordinates";
const locationDeniedMessage =
  "We couldn't access your location. You can still browse all destinations manually or enable location later in Settings.";

function readStoredPermission() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(permissionStorageKey);
  } catch {
    return null;
  }
}

function writeLocationStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Location remains usable for this session when persistent storage is blocked.
  }
}

function readCachedCoordinates(): Coordinates | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(cachedCoordinatesKey);
    const parsedValue = rawValue ? (JSON.parse(rawValue) as Coordinates) : null;

    if (
      Array.isArray(parsedValue) &&
      parsedValue.length === 2 &&
      parsedValue.every((value) => typeof value === "number")
    ) {
      return parsedValue;
    }
  } catch {
    return null;
  }

  return null;
}

export function useUserLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>("unknown");
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedPermission = readStoredPermission();
      const cachedCoordinates = readCachedCoordinates();

      if (cachedCoordinates) {
        setCoordinates(cachedCoordinates);
      }

      if (!("geolocation" in navigator)) {
        setPermissionStatus("unsupported");
        return;
      }

      if (storedPermission === "granted") {
        setPermissionStatus("granted");
      } else if (storedPermission === "denied") {
        setPermissionStatus("denied");
      } else {
        setPermissionStatus("prompt");
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const requestBrowserLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPermissionStatus("unsupported");
      setLocationMessage(locationDeniedMessage);
      setIsPermissionModalOpen(false);
      return;
    }

    setIsLocating(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoordinates: Coordinates = [position.coords.latitude, position.coords.longitude];

        setCoordinates(nextCoordinates);
        setPermissionStatus("granted");
        setIsPermissionModalOpen(false);
        setIsLocating(false);
        setLocationMessage("");
        writeLocationStorage(permissionStorageKey, "granted");
        writeLocationStorage(cachedCoordinatesKey, JSON.stringify(nextCoordinates));
      },
      () => {
        setPermissionStatus("denied");
        setIsPermissionModalOpen(false);
        setIsLocating(false);
        setLocationMessage(locationDeniedMessage);
        writeLocationStorage(permissionStorageKey, "denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 12000,
      }
    );
  }, []);

  const promptForLocationIfNeeded = useCallback(() => {
    const storedPermission = readStoredPermission();

    if (storedPermission === "granted") {
      if ("permissions" in navigator && navigator.permissions?.query) {
        navigator.permissions
          .query({ name: "geolocation" as PermissionName })
          .then((permission) => {
            if (permission.state === "granted") {
              requestBrowserLocation();
              return;
            }

            setIsPermissionModalOpen(true);
          })
          .catch(() => setIsPermissionModalOpen(true));
        return;
      }

      requestBrowserLocation();
      return;
    }

    if (storedPermission === "denied" || storedPermission === "later") {
      setPermissionStatus("denied");
      return;
    }

    setLocationMessage("");
    setIsPermissionModalOpen(true);
  }, [requestBrowserLocation]);

  const openLocationModal = useCallback(() => {
    setLocationMessage("");
    setIsPermissionModalOpen(true);
  }, []);

  const dismissLocationModal = useCallback(() => {
    setPermissionStatus("prompt");
    setIsPermissionModalOpen(false);
    setLocationMessage(locationDeniedMessage);
    writeLocationStorage(permissionStorageKey, "later");
  }, []);

  return {
    coordinates,
    permissionStatus,
    isPermissionModalOpen,
    isLocating,
    locationMessage,
    promptForLocationIfNeeded,
    openLocationModal,
    requestBrowserLocation,
    dismissLocationModal,
  };
}
