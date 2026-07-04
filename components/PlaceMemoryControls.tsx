"use client";

import { useEffect } from "react";
import { readStoredIds, useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import { LOCATION_FAVORITES_KEY, RECENT_PLACES_KEY } from "@/lib/appStorage";

type PlaceMemoryControlsProps = {
  placeId: string;
  placeName: string;
};

export default function PlaceMemoryControls({
  placeId,
  placeName,
}: PlaceMemoryControlsProps) {
  const favorites = useStoredIds(LOCATION_FAVORITES_KEY);
  const isFavorite = favorites.includes(placeId);

  useEffect(() => {
    const recent = readStoredIds(RECENT_PLACES_KEY);
    writeStoredIds(RECENT_PLACES_KEY, [placeId, ...recent.filter((id) => id !== placeId)]);
  }, [placeId]);

  const toggleFavorite = () => {
    const next = isFavorite
      ? favorites.filter((id) => id !== placeId)
      : [placeId, ...favorites.filter((id) => id !== placeId)];

    writeStoredIds(LOCATION_FAVORITES_KEY, next);
  };

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={`${isFavorite ? "Remove" : "Save"} ${placeName}`}
      onClick={toggleFavorite}
      className={`inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold transition ${
        isFavorite ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/15"
      }`}
    >
      {isFavorite ? "Saved to favorites" : "Save to favorites"}
    </button>
  );
}
