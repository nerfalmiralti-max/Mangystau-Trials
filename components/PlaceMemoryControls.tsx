"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readStoredIds, useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import { useToast } from "@/components/ToastProvider";
import { LOCATION_FAVORITES_KEY, RECENT_PLACES_KEY } from "@/lib/appStorage";

type PlaceMemoryControlsProps = {
  placeId: string;
  placeName: string;
};

export default function PlaceMemoryControls({
  placeId,
  placeName,
}: PlaceMemoryControlsProps) {
  const { showToast } = useToast();
  const favorites = useStoredIds(LOCATION_FAVORITES_KEY);
  const isFavorite = favorites.includes(placeId);
  const [status, setStatus] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    try {
      const recent = readStoredIds(RECENT_PLACES_KEY);
      writeStoredIds(RECENT_PLACES_KEY, [placeId, ...recent.filter((id) => id !== placeId)]);
    } catch {
      // Recent-history storage is optional and must not break the place page.
    }
  }, [placeId]);

  const toggleFavorite = async () => {
    if (pendingRef.current) return;

    pendingRef.current = true;
    setIsPending(true);
    const next = isFavorite
      ? favorites.filter((id) => id !== placeId)
      : [placeId, ...favorites.filter((id) => id !== placeId)];

    try {
      try {
        writeStoredIds(LOCATION_FAVORITES_KEY, next);
      } catch {
        setStatus("Favorites could not be updated on this device.");
        return;
      }

      setStatus(isFavorite ? "Removed from this device." : "Saved on this device.");
      setShowLoginPrompt(false);
      showToast({
        kind: "success",
        title: isFavorite ? "Favorite removed" : "Place saved",
        message: `${placeName} ${isFavorite ? "was removed from" : "is available in"} Saved trips.`,
      });

      const response = await fetch("/api/saved-locations", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ locationId: placeId }),
      });

      if (response.ok) {
        setStatus(
          isFavorite
            ? "Removed from your profile and this device."
            : "Saved to your profile and this device."
        );
      } else if (response.status === 401 && !isFavorite) {
        setStatus("Saved on this device. Log in to sync it with your profile.");
        setShowLoginPrompt(true);
      } else if (response.status === 401) {
        setStatus("Removed from this device. Log in to update any profile copy.");
      } else {
        setStatus(
          isFavorite
            ? "Removed from this device; profile sync is unavailable."
            : "Saved on this device; profile sync is unavailable."
        );
      }
    } catch {
      setStatus(
        isFavorite
          ? "Removed from this device; profile sync is offline."
          : "Saved on this device; profile sync is offline."
      );
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={isPending}
        aria-busy={isPending}
        aria-pressed={isFavorite}
        aria-label={`${isFavorite ? "Remove" : "Save"} ${placeName}`}
        onClick={() => void toggleFavorite()}
        className={`inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
          isFavorite ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/15"
        }`}
      >
        {isPending ? "Updating…" : isFavorite ? "Saved to favorites" : "Save to favorites"}
      </button>
      <div aria-live="polite" className={status ? "text-sm leading-6 text-white/62" : "sr-only"}>
        <span>{status || "Saved place status"}</span>
        {showLoginPrompt ? (
          <Link
            href={`/profile?mode=login&next=${encodeURIComponent(`/locations/${placeId}`)}`}
            className="mt-2 inline-flex font-semibold text-[#d9b382] underline underline-offset-4"
          >
            Log in to sync and return here
          </Link>
        ) : null}
      </div>
    </div>
  );
}
