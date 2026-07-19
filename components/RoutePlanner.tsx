"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import { SAVED_ROUTES_KEY } from "@/lib/appStorage";
import {
  buildGeneratedRoute,
  defaultRoutePreferences,
  isRouteDestinationCompatible,
  parseGeneratedRouteId,
  routeBudgetOptions,
  routeGroupOptions,
  routeInterests,
  routePaces,
  routeStartOptions,
  routeTransportOptions,
  type GeneratedRoutePlan,
  type RoutePreferences,
} from "@/lib/generatedRoute";
import { PLACES, getPlacesByIds } from "@/lib/siteData";

type RoutePlannerProps = {
  onRouteChange?: (placeIds: string[]) => void;
};

const wizardSteps = ["Trip", "Road", "Style", "Destination"] as const;
const mangystauPlaces = PLACES.filter((place) => place.region === "Mangystau" && place.id !== "aktau");

export default function RoutePlanner(props: RoutePlannerProps) {
  return (
    <Suspense fallback={<RoutePlannerLoading />}>
      <RoutePlannerRouteState {...props} />
    </Suspense>
  );
}

function RoutePlannerRouteState(props: RoutePlannerProps) {
  const searchParams = useSearchParams();
  const savedPlan = searchParams.get("plan");
  const requestedDestination = searchParams.get("destination");
  const parsedPlan = useMemo(
    () => (savedPlan ? parseGeneratedRouteId(savedPlan) : null),
    [savedPlan]
  );
  const destination =
    !parsedPlan &&
    requestedDestination &&
    isRouteDestinationCompatible(requestedDestination, defaultRoutePreferences.transport)
      ? requestedDestination
      : null;
  const initialPreferences = parsedPlan?.preferences ?? {
    ...defaultRoutePreferences,
    destinationId: destination ?? defaultRoutePreferences.destinationId,
  };

  return (
    <RoutePlannerExperience
      key={`${savedPlan ?? "new"}:${destination ?? "default"}`}
      {...props}
      initialPlan={parsedPlan}
      initialPreferences={initialPreferences}
      startAtDestination={Boolean(destination)}
    />
  );
}

function RoutePlannerExperience({
  onRouteChange,
  initialPlan,
  initialPreferences,
  startAtDestination,
}: RoutePlannerProps & {
  initialPlan: GeneratedRoutePlan | null;
  initialPreferences: RoutePreferences;
  startAtDestination: boolean;
}) {
  const [step, setStep] = useState(
    initialPlan || startAtDestination ? wizardSteps.length - 1 : 0
  );
  const [draft, setDraft] = useState<RoutePreferences>(initialPreferences);
  const [generatedPreferences, setGeneratedPreferences] =
    useState<RoutePreferences>(initialPlan?.preferences ?? initialPreferences);
  const [hasGenerated, setHasGenerated] = useState(Boolean(initialPlan));
  const [status, setStatus] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginHref, setLoginHref] = useState("");
  const [shareFallbackPath, setShareFallbackPath] = useState("");
  const [routeSaveAction, setRouteSaveAction] = useState<"save" | "remove" | null>(null);
  const savedRouteIds = useStoredIds(SAVED_ROUTES_KEY);
  const resultRef = useRef<HTMLDivElement>(null);
  const routeSavePendingRef = useRef(false);
  const generatedRoute = useMemo(
    () => buildGeneratedRoute(generatedPreferences),
    [generatedPreferences]
  );
  const routePlaces = useMemo(
    () => getPlacesByIds(generatedRoute.placeIds),
    [generatedRoute.placeIds]
  );
  const isSaved = savedRouteIds.includes(generatedRoute.id);
  const availableDestinations = mangystauPlaces.filter((place) =>
    isRouteDestinationCompatible(place.id, draft.transport)
  );

  useEffect(() => {
    if (initialPlan) {
      onRouteChange?.(initialPlan.placeIds);
    }
  }, [initialPlan, onRouteChange]);

  const updateDraft = <Key extends keyof RoutePreferences>(
    key: Key,
    value: RoutePreferences[Key]
  ) => {
    setDraft((current) => {
      const next: RoutePreferences = { ...current, [key]: value };

      if (!isRouteDestinationCompatible(next.destinationId, next.transport)) {
        next.destinationId = next.transport === "sedan" ? "torysh" : "bozzhyra";
      }

      return next;
    });
    setHasGenerated(false);
    setShowLoginPrompt(false);
    setShareFallbackPath("");
    setStatus(hasGenerated ? "Preferences changed. Create the route again to refresh the plan and map." : "");
  };

  const generateRoute = () => {
    const nextRoute = buildGeneratedRoute(draft);
    setGeneratedPreferences(nextRoute.preferences);
    setHasGenerated(true);
    setShowLoginPrompt(false);
    setShareFallbackPath("");
    setStatus("Route ready. The map now follows this expedition.");
    onRouteChange?.(nextRoute.placeIds);

    window.requestAnimationFrame(() => {
      if (window.innerWidth < 1024) {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const toggleSavedRoute = async () => {
    if (routeSavePendingRef.current) return;

    const wasSaved = isSaved;
    const next = wasSaved
      ? savedRouteIds.filter((id) => id !== generatedRoute.id)
      : [generatedRoute.id, ...savedRouteIds];
    routeSavePendingRef.current = true;
    setRouteSaveAction(wasSaved ? "remove" : "save");

    try {
      try {
        writeStoredIds(SAVED_ROUTES_KEY, next);
      } catch {
        setStatus("Saved routes could not be updated on this device.");
        return;
      }

      setStatus(wasSaved ? "Route removed from saved trips." : "Route saved on this device.");
      setShowLoginPrompt(false);

      const response = await fetch("/api/saved-routes", {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ planId: generatedRoute.id }),
      });

      if (response.ok) {
        setStatus(
          wasSaved
            ? "Route removed from your profile and this device."
            : "Route saved to your profile and this device."
        );
      } else if (response.status === 401 && !wasSaved) {
        setStatus("Route saved on this device. Log in to sync it with your profile.");
        const routeReturnPath = `/routes?plan=${encodeURIComponent(generatedRoute.id)}`;
        setLoginHref(`/profile?mode=login&next=${encodeURIComponent(routeReturnPath)}`);
        setShowLoginPrompt(true);
      } else if (response.status === 401) {
        setStatus("Route removed from this device. Log in to update any profile copy.");
      } else {
        setStatus(
          wasSaved
            ? "Route removed from this device; profile sync is unavailable."
            : "Route saved on this device; profile sync is unavailable."
        );
      }
    } catch {
      setStatus(
        wasSaved
          ? "Route removed from this device; profile sync is offline."
          : "Route saved on this device; profile sync is offline."
      );
    } finally {
      routeSavePendingRef.current = false;
      setRouteSaveAction(null);
    }
  };

  const shareRoute = async () => {
    const path = `/routes?plan=${encodeURIComponent(generatedRoute.id)}`;
    const url = `${window.location.origin}${path}`;
    const text = `${generatedRoute.title}: ${generatedRoute.days} days, ${generatedRoute.distanceKm} km, ${generatedRoute.placeIds.length} stops.`;
    setShareFallbackPath("");

    try {
      if (navigator.share) {
        await navigator.share({ title: generatedRoute.title, text, url });
        setStatus("Route shared.");
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setStatus("Share link copied.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareFallbackPath(path);
      setStatus("Automatic sharing is unavailable. Use the shareable route link below.");
    }
  };

  return (
    <section aria-labelledby="route-planner-title" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9b382]">
            Smart route builder
          </p>
          <h2 id="route-planner-title" className="mt-3 text-2xl font-semibold text-white md:text-3xl">
            Build a Mangystau expedition
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
            Four short decisions become a practical route with road time, safety notes and a backup plan.
          </p>
        </div>
        <p className="text-sm text-white/50">Step {step + 1} of {wizardSteps.length}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="glass-card p-5 md:p-6">
          <ol aria-label="Route builder progress" className="grid grid-cols-4 gap-2">
            {wizardSteps.map((label, index) => (
              <li key={label}>
                <button
                  type="button"
                  aria-current={step === index ? "step" : undefined}
                  onClick={() => setStep(index)}
                  className={`min-h-11 w-full rounded-full border px-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9b382] ${
                    step === index
                      ? "border-[#d9b382]/50 bg-[#d9b382] text-[#16110c]"
                      : index < step
                        ? "border-white/18 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-white/48"
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-6 min-h-[330px]">
            {step === 0 ? (
              <div className="space-y-6">
                <WizardHeading title="How much time do you have?" copy="Keep one daylight buffer for remote roads." />
                <label className="block rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <span className="flex items-center justify-between gap-4 text-sm text-white/68">
                    <span>Trip length</span>
                    <strong className="text-lg text-white">{draft.days} {draft.days === 1 ? "day" : "days"}</strong>
                  </span>
                  <input
                    aria-label="Trip length in days"
                    type="range"
                    min="1"
                    max="5"
                    value={draft.days}
                    onChange={(event) => updateDraft("days", Number(event.target.value))}
                    className="mt-5 w-full accent-[#d9b382]"
                  />
                </label>
                <OptionGroup
                  label="Starting point"
                  options={routeStartOptions}
                  value={draft.start}
                  onChange={(value) => updateDraft("start", value)}
                />
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <WizardHeading title="How will you travel?" copy="Remote tracks change what is realistically reachable." />
                <OptionGroup
                  label="Transport"
                  options={routeTransportOptions}
                  value={draft.transport}
                  onChange={(value) => updateDraft("transport", value)}
                />
                <OptionGroup
                  label="Travel group"
                  options={routeGroupOptions}
                  value={draft.group}
                  onChange={(value) => updateDraft("group", value)}
                />
                {draft.transport === "sedan" ? (
                  <p className="rounded-2xl border border-amber-300/20 bg-amber-300/8 p-4 text-sm leading-6 text-amber-100/78">
                    Sedan routes stay close to reliable roads. For Bozzhyra and Tuzbair, switch to a driver-guide or 4x4.
                  </p>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <WizardHeading title="What should the trip feel like?" copy="The route adapts its stops, pace and cost range." />
                <OptionGroup
                  label="Main interest"
                  options={routeInterests}
                  value={draft.interest}
                  onChange={(value) => updateDraft("interest", value)}
                />
                <OptionGroup
                  label="Pace"
                  options={routePaces.map((item) => ({ id: item, label: item }))}
                  value={draft.pace}
                  onChange={(value) => updateDraft("pace", value)}
                />
                <OptionGroup
                  label="Budget style"
                  options={routeBudgetOptions}
                  value={draft.budget}
                  onChange={(value) => updateDraft("budget", value)}
                />
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <WizardHeading title="Choose the main highlight" copy="You can still change or shorten the route after it is built." />
                <label className="grid gap-2">
                  <span className="text-sm text-white/62">Destination</span>
                  <select
                    value={draft.destinationId}
                    onChange={(event) => updateDraft("destinationId", event.target.value)}
                    className="min-h-12 w-full rounded-2xl border border-white/12 bg-[#11100e] px-4 text-white outline-none transition focus:border-[#d9b382] focus-visible:ring-2 focus-visible:ring-[#d9b382]/35"
                  >
                    {availableDestinations.map((place) => (
                      <option key={place.id} value={place.id}>{place.name}</option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <SummaryItem label="Duration" value={`${draft.days} days`} />
                  <SummaryItem label="Transport" value={getLabel(routeTransportOptions, draft.transport)} />
                  <SummaryItem label="Group" value={getLabel(routeGroupOptions, draft.group)} />
                  <SummaryItem label="Focus" value={getLabel(routeInterests, draft.interest)} />
                </div>
                <button type="button" onClick={generateRoute} className="primary-action w-full">
                  Create my route
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              className="btn min-h-11 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Back
            </button>
            {step < wizardSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(wizardSteps.length - 1, current + 1))}
                className="btn btn-active min-h-11"
              >
                Continue
              </button>
            ) : null}
          </div>
        </div>

        <motion.div
          ref={resultRef}
          key={hasGenerated ? generatedRoute.id : "route-preview"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card scroll-mt-24 p-5 md:p-6"
        >
          {hasGenerated ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b382]">
                    {generatedRoute.eyebrow}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-white md:text-3xl">{generatedRoute.title}</h3>
                </div>
                <span className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-4 py-2 text-xs font-semibold text-emerald-100">
                  Route ready
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                {generatedRoute.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Distance" value={`≈ ${generatedRoute.distanceKm} km`} />
                <Metric label="Road time" value={generatedRoute.driveTime} />
                <Metric label="Difficulty" value={generatedRoute.difficulty} />
                <Metric label="Budget" value={generatedRoute.budget} />
              </div>

              <div className="mt-6 rounded-[20px] border border-[#d9b382]/18 bg-[#d9b382]/7 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b382]">Why this fits</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">
                  {generatedRoute.reasons.map((reason) => (
                    <li key={reason} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9b382]" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Journey timeline</p>
                <div className="mt-4 grid gap-3">
                  {generatedRoute.dayPlan.map((day, index) => (
                    <div key={day} className="grid grid-cols-[40px_1fr] gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-white/70">{day}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
                {routePlaces.map((place, index) => (
                  <Link
                    key={place.id}
                    href={`/locations/${place.id}`}
                    className="shrink-0 rounded-full border border-white/12 bg-white/6 px-3 py-2 text-sm text-white/72 transition hover:border-white/28 hover:text-white"
                  >
                    {index + 1}. {place.name}
                  </Link>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PlanDetails title="What to take" items={generatedRoute.equipment} />
                <PlanDetails title="Safety check" items={generatedRoute.warnings} />
                <PlanDetails title="Where to stay" items={generatedRoute.overnight} />
                <details className="rounded-[20px] border border-white/10 bg-white/5 p-4 open:bg-white/8">
                  <summary className="cursor-pointer font-semibold text-white">Backup route</summary>
                  <p className="mt-3 text-sm leading-6 text-white/65">{generatedRoute.alternative}</p>
                </details>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  aria-busy={routeSaveAction !== null}
                  disabled={routeSaveAction !== null}
                  onClick={() => void toggleSavedRoute()}
                  className={`btn min-h-12 justify-center disabled:cursor-wait disabled:opacity-55 ${isSaved ? "btn-active" : "chat-button"}`}
                >
                  {routeSaveAction === "save"
                    ? "Saving…"
                    : routeSaveAction === "remove"
                      ? "Removing…"
                      : isSaved
                        ? "Saved"
                        : "Save route"}
                </button>
                <button type="button" onClick={() => void shareRoute()} className="btn min-h-12 justify-center">
                  Share plan
                </button>
                <a
                  href="#route-map"
                  onClick={() => onRouteChange?.(generatedRoute.placeIds)}
                  className="btn min-h-12 justify-center"
                >
                  View on map
                </a>
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(217,179,130,0.16),transparent_35%),linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d9b382]">Live preview</p>
                <h3 className="mt-4 max-w-md text-2xl font-semibold leading-tight text-white md:text-3xl">
                  Your route will explain every important choice.
                </h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/62">
                  Not just pins: road time, difficulty, equipment, overnight options and a safer alternative.
                </p>
              </div>
              <div className="space-y-3">
                {["A route paced to daylight", "Practical road and safety context", "One shareable plan for the whole group"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/18 p-4 text-sm text-white/68">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-xs text-white/55">0{index + 1}</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div aria-live="polite" className={`min-h-6 text-sm ${status ? "text-emerald-200/78" : "text-transparent"}`}>
        <p>{status || "Route status"}</p>
        {showLoginPrompt && hasGenerated ? (
          <Link
            href={loginHref}
            className="mt-2 inline-flex font-semibold text-[#d9b382] underline underline-offset-4"
          >
            Log in to sync and keep this route
          </Link>
        ) : null}
        {shareFallbackPath && hasGenerated ? (
          <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-white/72 sm:grid-cols-[1fr_auto] sm:items-center">
            <label className="sr-only" htmlFor="shareable-route-link">Shareable route link</label>
            <input
              id="shareable-route-link"
              readOnly
              value={`${typeof window === "undefined" ? "" : window.location.origin}${shareFallbackPath}`}
              onFocus={(event) => event.currentTarget.select()}
              className="min-h-11 min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-white outline-none focus:border-white/30"
            />
            <Link href={shareFallbackPath} className="btn min-h-11 justify-center text-center">
              Open shareable route
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function RoutePlannerLoading() {
  return (
    <div role="status" aria-busy="true" className="glass-card min-h-[480px] p-6">
      <span className="sr-only">Loading route builder</span>
      <div aria-hidden="true" className="h-3 w-36 animate-pulse rounded-full bg-white/12" />
      <div aria-hidden="true" className="mt-5 h-9 max-w-md animate-pulse rounded-xl bg-white/10" />
      <div aria-hidden="true" className="mt-8 h-72 animate-pulse rounded-[22px] bg-white/6" />
    </div>
  );
}

function WizardHeading({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white md:text-2xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{copy}</p>
    </div>
  );
}

function OptionGroup<const Options extends readonly { id: string; label: string }[]>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Options;
  value: Options[number]["id"];
  onChange: (value: Options[number]["id"]) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm text-white/62">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`btn min-h-11 ${value === option.id ? "btn-active" : "bg-white/5 text-white/78"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function PlanDetails({ title, items }: { title: string; items: string[] }) {
  return (
    <details className="rounded-[20px] border border-white/10 bg-white/5 p-4 open:bg-white/8">
      <summary className="cursor-pointer font-semibold text-white">{title}</summary>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </details>
  );
}

function getLabel<const Options extends readonly { id: string; label: string }[]>(
  options: Options,
  value: Options[number]["id"]
) {
  return options.find((option) => option.id === value)?.label ?? value;
}
