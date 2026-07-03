"use client";

import { useEffect } from "react";
import { readStoredIds, useStoredIds, writeStoredIds } from "@/components/useStoredIds";

type PlaceMemoryControlsProps = {
  placeId: string;
  placeName: string;
};

const FAVORITES_KEY = "nomadgo:favoritePlaces";
const RECENT_KEY = "nomadgo:recentPlaces";

export default function PlaceMemoryControls({
  placeId,
  placeName,
}: PlaceMemoryControlsProps) {
  const favorites = useStoredIds(FAVORITES_KEY);
  const isFavorite = favorites.includes(placeId);

  useEffect(() => {
    const recent = readStoredIds(RECENT_KEY);
    writeStoredIds(RECENT_KEY, [placeId, ...recent.filter((id) => id !== placeId)]);
  }, [placeId]);

  const toggleFavorite = () => {
    const next = isFavorite
      ? favorites.filter((id) => id !== placeId)
      : [placeId, ...favorites.filter((id) => id !== placeId)];

    writeStoredIds(FAVORITES_KEY, next);
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
