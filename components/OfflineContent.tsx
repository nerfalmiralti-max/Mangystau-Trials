"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import { OFFLINE_DESTINATIONS_KEY, OFFLINE_MAPS_KEY, OFFLINE_ROUTES_KEY } from "@/lib/appStorage";
import { guideDestinations, type GuideDestination } from "@/lib/guideData";
import { buildPlanner, parsePlannerRouteId, type PlannerPlan } from "@/lib/tripPlannerData";

type MapPack = {
  id: string;
  name: string;
  area: string;
  sizeMb: number;
};

const mapPacks: MapPack[] = [
  { id: "aktau-base-map", name: "Aktau Base Map", area: "City and seaside", sizeMb: 42 },
  { id: "central-mangystau-map", name: "Central Mangystau Map", area: "Torysh and Sherkala", sizeMb: 58 },
  { id: "ustyurt-expedition-map", name: "Ustyurt Expedition Map", area: "Bozzhyra and Tuzbair", sizeMb: 74 },
];

const recommendedRoutes = [
  buildPlanner("Weekend", "Nature"),
  buildPlanner("3 days", "Adventure"),
  buildPlanner("1 day", "Family"),
];

export default function OfflineContent() {
  const guideIds = useStoredIds(OFFLINE_DESTINATIONS_KEY);
  const routeIds = useStoredIds(OFFLINE_ROUTES_KEY);
  const mapIds = useStoredIds(OFFLINE_MAPS_KEY);
  const [isManaging, setIsManaging] = useState(false);
  const [status, setStatus] = useState("");

  const downloadedGuides = useMemo(
    () =>
      guideIds
        .map((id) => guideDestinations.find((destination) => destination.id === id))
        .filter((destination): destination is GuideDestination => Boolean(destination)),
    [guideIds]
  );
  const downloadedRoutes = useMemo(
    () =>
      routeIds
        .map((id) => parsePlannerRouteId(id))
        .filter((route): route is PlannerPlan => Boolean(route)),
    [routeIds]
  );
  const downloadedMaps = useMemo(
    () =>
      mapIds
        .map((id) => mapPacks.find((map) => map.id === id))
        .filter((map): map is MapPack => Boolean(map)),
    [mapIds]
  );

  const downloadedSizeMb =
    downloadedGuides.length * 18 +
    downloadedRoutes.length * 9 +
    downloadedMaps.reduce((sum, map) => sum + map.sizeMb, 0);

  const downloadGuide = (id: string) => {
    writeStoredIds(OFFLINE_DESTINATIONS_KEY, [id, ...guideIds]);
    setStatus("Guide downloaded");
  };

  const deleteGuide = (id: string) => {
    writeStoredIds(OFFLINE_DESTINATIONS_KEY, guideIds.filter((item) => item !== id));
    setStatus("Guide deleted");
  };

  const downloadRoute = (id: string) => {
    writeStoredIds(OFFLINE_ROUTES_KEY, [id, ...routeIds]);
    setStatus("Route downloaded");
  };

  const deleteRoute = (id: string) => {
    writeStoredIds(OFFLINE_ROUTES_KEY, routeIds.filter((item) => item !== id));
    setStatus("Route deleted");
  };

  const downloadMap = (id: string) => {
    writeStoredIds(OFFLINE_MAPS_KEY, [id, ...mapIds]);
    setStatus("Map downloaded");
  };

  const deleteMap = (id: string) => {
    writeStoredIds(OFFLINE_MAPS_KEY, mapIds.filter((item) => item !== id));
    setStatus("Map deleted");
  };

  const downloadRecommended = () => {
    writeStoredIds(OFFLINE_DESTINATIONS_KEY, guideDestinations.slice(0, 4).map((destination) => destination.id));
    writeStoredIds(OFFLINE_ROUTES_KEY, recommendedRoutes.slice(0, 2).map((route) => route.id));
    writeStoredIds(OFFLINE_MAPS_KEY, mapPacks.slice(0, 2).map((map) => map.id));
    setStatus("Recommended downloads ready");
  };

  return (
    <div className="space-y-4">
      <section className="glass-card p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Downloaded size</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{downloadedSizeMb} MB</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/62">
            <Stat value={downloadedRoutes.length} label="Routes" />
            <Stat value={downloadedGuides.length} label="Guides" />
            <Stat value={downloadedMaps.length} label="Maps" />
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={downloadRecommended} className="btn chat-button justify-center">
            Download
          </button>
          <button type="button" onClick={() => setIsManaging((value) => !value)} className="btn justify-center">
            Manage Downloads
          </button>
          <Link href="/saved" className="btn justify-center text-center">
            Saved
          </Link>
        </div>
      </section>

      {status ? (
        <p aria-live="polite" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/66">
          {status}
        </p>
      ) : null}

      <OfflineSection title="Downloaded Routes" count={downloadedRoutes.length} defaultOpen>
        {downloadedRoutes.length > 0 ? (
          downloadedRoutes.map((route) => (
            <RouteOfflineCard key={route.id} route={route} isManaging={isManaging} onDelete={() => deleteRoute(route.id)} />
          ))
        ) : (
          <SuggestionList>
            {recommendedRoutes.map((route) => (
              <RouteOfflineCard
                key={route.id}
                route={route}
                actionLabel="Download"
                onAction={() => downloadRoute(route.id)}
              />
            ))}
          </SuggestionList>
        )}
      </OfflineSection>

      <OfflineSection title="Guides" count={downloadedGuides.length}>
        {downloadedGuides.length > 0 ? (
          downloadedGuides.map((destination) => (
            <GuideOfflineCard
              key={destination.id}
              destination={destination}
              isManaging={isManaging}
              onDelete={() => deleteGuide(destination.id)}
            />
          ))
        ) : (
          <SuggestionList>
            {guideDestinations.slice(0, 4).map((destination) => (
              <GuideOfflineCard
                key={destination.id}
                destination={destination}
                actionLabel="Download"
                onAction={() => downloadGuide(destination.id)}
              />
            ))}
          </SuggestionList>
        )}
      </OfflineSection>

      <OfflineSection title="Maps" count={downloadedMaps.length}>
        {(downloadedMaps.length > 0 ? downloadedMaps : mapPacks).map((map) => (
          <MapOfflineCard
            key={map.id}
            map={map}
            isDownloaded={mapIds.includes(map.id)}
            isManaging={isManaging}
            onDownload={() => downloadMap(map.id)}
            onDelete={() => deleteMap(map.id)}
          />
        ))}
      </OfflineSection>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-base font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-white/42">{label}</p>
    </div>
  );
}

function OfflineSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="rounded-[20px] border border-white/10 bg-white/5 p-4 open:bg-white/7">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="font-semibold text-white">{title}</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58">{count}</span>
      </summary>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div>
    </details>
  );
}

function SuggestionList({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function RouteOfflineCard({
  route,
  isManaging = false,
  actionLabel,
  onAction,
  onDelete,
}: {
  route: PlannerPlan;
  isManaging?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onDelete?: () => void;
}) {
  const cover = route.stops[0]?.image ?? "/locations/photos/bozzhyra.jpg";

  return (
    <article className="grid grid-cols-[96px_1fr] overflow-hidden rounded-[18px] border border-white/10 bg-white/5">
      <div className="relative min-h-28 bg-white/5">
        <Image src={cover} alt={`${route.title} photo`} fill sizes="96px" className="object-cover" />
      </div>
      <div className="min-w-0 p-3">
        <h3 className="truncate text-sm font-semibold text-white">{route.title}</h3>
        <p className="mt-2 text-xs text-white/52">{route.meta} / 9 MB</p>
        <div className="mt-3 flex gap-2">
          {actionLabel && onAction ? (
            <button type="button" onClick={onAction} className="btn min-h-9 px-3 py-2 text-xs">
              {actionLabel}
            </button>
          ) : null}
          {isManaging && onDelete ? (
            <button type="button" onClick={onDelete} className="btn min-h-9 px-3 py-2 text-xs">
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function GuideOfflineCard({
  destination,
  isManaging = false,
  actionLabel,
  onAction,
  onDelete,
}: {
  destination: GuideDestination;
  isManaging?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article className="grid grid-cols-[96px_1fr] overflow-hidden rounded-[18px] border border-white/10 bg-white/5">
      <div className="relative min-h-28 bg-white/5">
        <Image src={destination.image} alt={`${destination.name} photo`} fill sizes="96px" className="object-cover" />
      </div>
      <div className="min-w-0 p-3">
        <h3 className="truncate text-sm font-semibold text-white">{destination.name}</h3>
        <p className="mt-2 text-xs text-white/52">{destination.travelTime} / 18 MB</p>
        <div className="mt-3 flex gap-2">
          {actionLabel && onAction ? (
            <button type="button" onClick={onAction} className="btn min-h-9 px-3 py-2 text-xs">
              {actionLabel}
            </button>
          ) : null}
          {isManaging && onDelete ? (
            <button type="button" onClick={onDelete} className="btn min-h-9 px-3 py-2 text-xs">
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function MapOfflineCard({
  map,
  isDownloaded,
  isManaging,
  onDownload,
  onDelete,
}: {
  map: MapPack;
  isDownloaded: boolean;
  isManaging: boolean;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-[18px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{map.name}</h3>
          <p className="mt-2 text-xs text-white/52">{map.area} / {map.sizeMb} MB</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58">
          {isDownloaded ? "Ready" : "Map"}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        {!isDownloaded ? (
          <button type="button" onClick={onDownload} className="btn min-h-9 px-3 py-2 text-xs">
            Download
          </button>
        ) : null}
        {isDownloaded && isManaging ? (
          <button type="button" onClick={onDelete} className="btn min-h-9 px-3 py-2 text-xs">
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
