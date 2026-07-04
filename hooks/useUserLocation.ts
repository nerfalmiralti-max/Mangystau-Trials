"use client";

import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/lib/geo";

export type LocationPermissionStatus = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

const permissionStorageKey = "mangystau-location-permission";
const cachedCoordinatesKey = "mangystau-user-coordinates";
const locationDeniedMessage =
  "We couldn't access your location. You can still browse all destinations manually or enable location later in Settings.";

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
      const storedPermission = window.localStorage.getItem(permissionStorageKey);
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
      } else if (storedPermission === "denied" || storedPermission === "later") {
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

        window.localStorage.setItem(permissionStorageKey, "granted");
        window.localStorage.setItem(cachedCoordinatesKey, JSON.stringify(nextCoordinates));
        setCoordinates(nextCoordinates);
        setPermissionStatus("granted");
        setIsPermissionModalOpen(false);
        setIsLocating(false);
        setLocationMessage("");
      },
      () => {
        window.localStorage.setItem(permissionStorageKey, "denied");
        setPermissionStatus("denied");
        setIsPermissionModalOpen(false);
        setIsLocating(false);
        setLocationMessage(locationDeniedMessage);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 12000,
      }
    );
  }, []);

  const promptForLocationIfNeeded = useCallback(() => {
    const storedPermission = window.localStorage.getItem(permissionStorageKey);

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
    window.localStorage.setItem(permissionStorageKey, "later");
    setPermissionStatus("denied");
    setIsPermissionModalOpen(false);
    setLocationMessage(locationDeniedMessage);
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
