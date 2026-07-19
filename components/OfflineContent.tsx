"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import { OFFLINE_DESTINATIONS_KEY, OFFLINE_MAPS_KEY, OFFLINE_ROUTES_KEY } from "@/lib/appStorage";
import { guideDestinations, type GuideDestination } from "@/lib/guideData";
import { buildPlanner, parsePlannerRouteId, type PlannerPlan } from "@/lib/tripPlannerData";

type AreaChecklist = {
  id: string;
  name: string;
  area: string;
};

const areaChecklists: AreaChecklist[] = [
  { id: "aktau-base-map", name: "Aktau essentials", area: "City and seaside" },
  { id: "central-mangystau-map", name: "Central Mangystau checklist", area: "Torysh and Sherkala" },
  { id: "ustyurt-expedition-map", name: "Ustyurt expedition checklist", area: "Bozzhyra and Tuzbair" },
];

const recommendedRoutes = [
  buildPlanner("Weekend", "Nature"),
  buildPlanner("3 days", "Adventure"),
  buildPlanner("1 day", "Family"),
];

export default function OfflineContent() {
  const guideIds = useStoredIds(OFFLINE_DESTINATIONS_KEY);
  const routeIds = useStoredIds(OFFLINE_ROUTES_KEY);
  const areaRecordIds = useStoredIds(OFFLINE_MAPS_KEY);
  const [isManaging, setIsManaging] = useState(false);
  const [status, setStatus] = useState("");

  const preparedGuides = useMemo(
    () =>
      guideIds
        .map((id) => guideDestinations.find((destination) => destination.id === id))
        .filter((destination): destination is GuideDestination => Boolean(destination)),
    [guideIds]
  );
  const preparedRoutes = useMemo(
    () =>
      routeIds
        .map((id) => parsePlannerRouteId(id))
        .filter((route): route is PlannerPlan => Boolean(route)),
    [routeIds]
  );
  const preparedAreaChecklists = useMemo(
    () =>
      areaRecordIds
        .map((id) => areaChecklists.find((checklist) => checklist.id === id))
        .filter((checklist): checklist is AreaChecklist => Boolean(checklist)),
    [areaRecordIds]
  );
  const suggestedRoutes = recommendedRoutes.filter((route) => !routeIds.includes(route.id));
  const suggestedGuides = guideDestinations
    .slice(0, 4)
    .filter((destination) => !guideIds.includes(destination.id));

  const preparedRecordCount =
    preparedGuides.length + preparedRoutes.length + preparedAreaChecklists.length;
  const hasManageableRecords = preparedRecordCount > 0;

  const prepareGuide = (id: string) => {
    updateOfflineRecords(OFFLINE_DESTINATIONS_KEY, [id, ...guideIds], "Guide record saved on this device");
  };

  const removeGuide = (id: string) => {
    updateOfflineRecords(OFFLINE_DESTINATIONS_KEY, guideIds.filter((item) => item !== id), "Guide record removed");
  };

  const prepareRoute = (id: string) => {
    updateOfflineRecords(OFFLINE_ROUTES_KEY, [id, ...routeIds], "Route record saved on this device");
  };

  const removeRoute = (id: string) => {
    updateOfflineRecords(OFFLINE_ROUTES_KEY, routeIds.filter((item) => item !== id), "Route record removed");
  };

  const prepareAreaChecklist = (id: string) => {
    updateOfflineRecords(OFFLINE_MAPS_KEY, [id, ...areaRecordIds], "Area checklist prepared");
  };

  const removeAreaChecklist = (id: string) => {
    updateOfflineRecords(OFFLINE_MAPS_KEY, areaRecordIds.filter((item) => item !== id), "Area checklist removed");
  };

  const prepareRecommended = () => {
    try {
      writeStoredIds(OFFLINE_DESTINATIONS_KEY, [
        ...guideDestinations.slice(0, 4).map((destination) => destination.id),
        ...guideIds,
      ]);
      writeStoredIds(OFFLINE_ROUTES_KEY, [
        ...recommendedRoutes.slice(0, 2).map((route) => route.id),
        ...routeIds,
      ]);
      writeStoredIds(OFFLINE_MAPS_KEY, [
        ...areaChecklists.slice(0, 2).map((checklist) => checklist.id),
        ...areaRecordIds,
      ]);
      setStatus("Recommended planning records added without replacing your existing records");
    } catch {
      setStatus("Planning records could not be updated because browser storage is unavailable.");
    }
  };

  const updateOfflineRecords = (key: string, ids: string[], successMessage: string) => {
    try {
      writeStoredIds(key, ids);
      setStatus(successMessage);
    } catch {
      setStatus("Planning records could not be updated because browser storage is unavailable.");
    }
  };

  return (
    <div className="space-y-4">
      <section id="offline-preparation" className="glass-card scroll-mt-24 p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/40">Offline preparation</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{preparedRecordCount} saved records</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/62">
            <Stat value={preparedRoutes.length} label="Routes" />
            <Stat value={preparedGuides.length} label="Guides" />
            <Stat value={preparedAreaChecklists.length} label="Area lists" />
          </div>
        </div>
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/58">
          These are planning records saved in this browser. Map tiles, route files and guide media are not
          cached for offline use yet.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={prepareRecommended} className="btn chat-button justify-center">
            Prepare suggested
          </button>
          <button
            type="button"
            disabled={!hasManageableRecords}
            aria-pressed={hasManageableRecords ? isManaging : false}
            onClick={() => setIsManaging((value) => !value)}
            className="btn justify-center disabled:cursor-not-allowed disabled:opacity-45"
          >
            {!hasManageableRecords ? "Nothing to manage" : isManaging ? "Done managing" : "Manage records"}
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

      <OfflineSection title="Prepared route records" count={preparedRoutes.length} defaultOpen>
        {preparedRoutes.map((route) => (
          <RouteOfflineCard
            key={route.id}
            route={route}
            isManaging={isManaging}
            onDelete={() => removeRoute(route.id)}
          />
        ))}
        {suggestedRoutes.map((route) => (
          <RouteOfflineCard
            key={route.id}
            route={route}
            actionLabel="Prepare"
            onAction={() => prepareRoute(route.id)}
          />
        ))}
      </OfflineSection>

      <OfflineSection title="Prepared guide records" count={preparedGuides.length}>
        {preparedGuides.map((destination) => (
          <GuideOfflineCard
            key={destination.id}
            destination={destination}
            isManaging={isManaging}
            onDelete={() => removeGuide(destination.id)}
          />
        ))}
        {suggestedGuides.map((destination) => (
          <GuideOfflineCard
            key={destination.id}
            destination={destination}
            actionLabel="Prepare"
            onAction={() => prepareGuide(destination.id)}
          />
        ))}
      </OfflineSection>

      <OfflineSection title="Area checklists" count={preparedAreaChecklists.length}>
        {areaChecklists.map((checklist) => (
          <AreaChecklistCard
            key={checklist.id}
            checklist={checklist}
            isPrepared={areaRecordIds.includes(checklist.id)}
            isManaging={isManaging}
            onPrepare={() => prepareAreaChecklist(checklist.id)}
            onRemove={() => removeAreaChecklist(checklist.id)}
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
        <p className="mt-2 text-xs text-white/52">
          {route.meta} / {actionLabel ? "Suggested record" : "Saved record"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/chat?view=planner&plan=${encodeURIComponent(route.id)}`}
            className="btn min-h-9 px-3 py-2 text-xs"
          >
            Open details
          </Link>
          {actionLabel && onAction ? (
            <button type="button" onClick={onAction} className="btn min-h-9 px-3 py-2 text-xs">
              {actionLabel}
            </button>
          ) : null}
          {isManaging && onDelete ? (
            <button type="button" onClick={onDelete} className="btn min-h-9 px-3 py-2 text-xs">
              Remove
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
        <p className="mt-2 text-xs text-white/52">
          {destination.travelTime} / {actionLabel ? "Suggested guide" : "Saved guide"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/chat?place=${encodeURIComponent(destination.id)}`}
            className="btn min-h-9 px-3 py-2 text-xs"
          >
            Open guide
          </Link>
          {actionLabel && onAction ? (
            <button type="button" onClick={onAction} className="btn min-h-9 px-3 py-2 text-xs">
              {actionLabel}
            </button>
          ) : null}
          {isManaging && onDelete ? (
            <button type="button" onClick={onDelete} className="btn min-h-9 px-3 py-2 text-xs">
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function AreaChecklistCard({
  checklist,
  isPrepared,
  isManaging,
  onPrepare,
  onRemove,
}: {
  checklist: AreaChecklist;
  isPrepared: boolean;
  isManaging: boolean;
  onPrepare: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-[18px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{checklist.name}</h3>
          <p className="mt-2 text-xs text-white/52">{checklist.area} / Browser record</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/58">
          {isPrepared ? "Prepared" : "Checklist"}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        {!isPrepared ? (
          <button type="button" onClick={onPrepare} className="btn min-h-9 px-3 py-2 text-xs">
            Prepare
          </button>
        ) : null}
        {isPrepared && isManaging ? (
          <button type="button" onClick={onRemove} className="btn min-h-9 px-3 py-2 text-xs">
            Remove
          </button>
        ) : null}
      </div>
    </article>
  );
}
