"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useDeferredValue,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import BottomSheet from "@/components/BottomSheet";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import TravelGallery from "@/components/TravelGallery";
import { useStoredIds, writeStoredIds } from "@/components/useStoredIds";
import {
  GUIDE_FAVORITES_KEY,
  OFFLINE_DESTINATIONS_KEY,
  SAVED_HOTELS_KEY,
  SAVED_ROUTES_KEY,
} from "@/lib/appStorage";
import {
  buildDestinationRouteUrl,
  getGuideSearchText,
  getHotelsNearDestination,
  getServicesNearDestination,
  guideDestinations,
  guideFilters,
  type GuideDestination,
  type GuideFilter,
} from "@/lib/guideData";
import {
  buildGoogleMapsDirectionsUrl,
  formatDistanceKm,
  getHaversineDistanceKm,
  sortByDistance,
  type Coordinates,
} from "@/lib/geo";
import { mangystauHotels, type HotelOption, type NearbyService } from "@/lib/hotelsData";
import { emergencyContacts } from "@/lib/travelAssistantData";
import {
  buildPlanner,
  parsePlannerRouteId,
  plannerDurations,
  plannerThemes,
  type PlannerDuration,
  type PlannerPlan,
  type PlannerTheme,
} from "@/lib/tripPlannerData";
import { useUserLocation } from "@/hooks/useUserLocation";

type GuideView = "guide" | "hotels" | "planner" | "favorites";
type HotelSortMode = "nearest" | "rating" | "price";
type ActionSheetMode = "actions" | "emergency" | null;
type ActiveGuideFilter = GuideFilter | "all";

type HotelWithDistance = HotelOption & {
  distanceFromUserKm?: number;
  formattedDistanceFromUser?: string;
};

type ServiceWithDistance = NearbyService & {
  distanceFromUserKm?: number;
  formattedDistanceFromUser?: string;
};

const AKTAU_CENTER: Coordinates = [43.653, 51.197];

const guideViews: { id: GuideView; label: string }[] = [
  { id: "guide", label: "Guide" },
  { id: "hotels", label: "Hotels" },
  { id: "planner", label: "Planner" },
  { id: "favorites", label: "Saved" },
];

const hotelSortOptions: { id: HotelSortMode; label: string }[] = [
  { id: "nearest", label: "Nearest" },
  { id: "rating", label: "Rating" },
  { id: "price", label: "Price" },
];

const assistantQuickPrompts = [
  "When is the best season?",
  "What are the roads like?",
  "Is it suitable for a family?",
  "What should I pack?",
] as const;

const icon = {
  star: "\u2B50",
  clock: "\u23F1",
  pin: "\uD83D\uDCCD",
  car: "\uD83D\uDE97",
  temp: "\uD83C\uDF21",
};

export default function MangystauGuideApp() {
  return (
    <Suspense fallback={<GuideAppFallback />}>
      <MangystauGuideRouteState />
    </Suspense>
  );
}

function MangystauGuideRouteState() {
  const searchParams = useSearchParams();
  const requestedPlaceId = searchParams.get("place");
  const requestedView = searchParams.get("view");
  const requestedPlanId = searchParams.get("plan");
  const plannerSelection =
    requestedView === "planner" ? getLegacyPlannerSelection(requestedPlanId) : null;
  const initialPlannerSelection = plannerSelection ?? {
    duration: "Weekend" as const,
    theme: "Nature" as const,
  };
  const initialDestination =
    requestedView === "planner" ? null : getDestinationFromQuery(requestedPlaceId);
  const initialAssistantDestination =
    requestedView === "planner"
      ? buildPlanner(initialPlannerSelection.duration, initialPlannerSelection.theme).stops.at(-1) ??
        guideDestinations[0]
      : initialDestination ?? guideDestinations[0];

  return (
    <MangystauGuideExperience
      key={searchParams.toString() || "guide-default"}
      initialView={requestedView === "planner" ? "planner" : "guide"}
      initialDestination={initialDestination}
      initialAssistantDestination={initialAssistantDestination}
      initialPlannerSelection={initialPlannerSelection}
    />
  );
}

function MangystauGuideExperience({
  initialView,
  initialDestination,
  initialAssistantDestination,
  initialPlannerSelection,
}: {
  initialView: GuideView;
  initialDestination: GuideDestination | null;
  initialAssistantDestination: GuideDestination;
  initialPlannerSelection: { duration: PlannerDuration; theme: PlannerTheme };
}) {
  const [activeView, setActiveView] = useState<GuideView>(initialView);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [activeFilter, setActiveFilter] = useState<ActiveGuideFilter>("all");
  const [hotelSort, setHotelSort] = useState<HotelSortMode>("nearest");
  const [selectedDestination, setSelectedDestination] =
    useState<GuideDestination | null>(initialDestination);
  const [actionSheetMode, setActionSheetMode] = useState<ActionSheetMode>(null);
  const [plannerDuration, setPlannerDuration] = useState<PlannerDuration>(
    initialPlannerSelection.duration
  );
  const [plannerTheme, setPlannerTheme] = useState<PlannerTheme>(initialPlannerSelection.theme);
  const [actionStatus, setActionStatus] = useState("");
  const [assistantDestination, setAssistantDestination] = useState<GuideDestination>(
    initialAssistantDestination
  );
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const userLocation = useUserLocation();
  const favoriteIds = useStoredIds(GUIDE_FAVORITES_KEY);
  const offlineIds = useStoredIds(OFFLINE_DESTINATIONS_KEY);
  const savedHotelIds = useStoredIds(SAVED_HOTELS_KEY);
  const savedRouteIds = useStoredIds(SAVED_ROUTES_KEY);

  const indexedDestinations = useMemo(
    () =>
      guideDestinations.map((destination) => ({
        destination,
        searchText: getGuideSearchText(destination),
      })),
    []
  );

  const filteredDestinations = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const filterId = activeFilter;

    return indexedDestinations
      .filter(({ destination, searchText }) => {
        const matchesFilter = filterId === "all" || destination.filters.includes(filterId);
        const matchesSearch = !query || searchText.includes(query);

        return matchesFilter && matchesSearch;
      })
      .map(({ destination }) => destination);
  }, [activeFilter, deferredSearchQuery, indexedDestinations]);

  const favoriteDestinations = useMemo(
    () => guideDestinations.filter((destination) => favoriteIds.includes(destination.id)),
    [favoriteIds]
  );

  const sortedHotels = useMemo(() => {
    const origin = userLocation.coordinates ?? AKTAU_CENTER;
    const query = deferredSearchQuery.trim().toLowerCase();
    const hotels = sortByDistance(
      mangystauHotels,
      origin,
      (hotel) => hotel.coordinates
    ) as HotelWithDistance[];
    const visibleHotels =
      query && query !== "hotel" && query !== "hotels"
        ? hotels.filter((hotel) =>
            [
              hotel.name,
              hotel.address,
              hotel.cityArea,
              hotel.type,
              hotel.priceRange,
              ...hotel.amenities,
              ...hotel.recommendedFor,
            ]
              .join(" ")
              .toLowerCase()
              .includes(query)
          )
        : hotels;

    return visibleHotels.sort((first, second) => {
      if (hotelSort === "rating") {
        return second.rating - first.rating || first.name.localeCompare(second.name);
      }

      if (hotelSort === "price") {
        return getPriceFloor(first.priceRange) - getPriceFloor(second.priceRange);
      }

      return (first.distanceFromUserKm ?? 0) - (second.distanceFromUserKm ?? 0);
    });
  }, [deferredSearchQuery, hotelSort, userLocation.coordinates]);

  const planner = useMemo(
    () => buildPlanner(plannerDuration, plannerTheme),
    [plannerDuration, plannerTheme]
  );

  const openDestination = (destination: GuideDestination) => {
    setSelectedDestination(destination);
    setAssistantDestination(destination);
    setAssistantAnswer("");
  };

  const askAssistant = (question: string) => {
    const normalizedQuestion = question.replace(/\s+/g, " ").trim().slice(0, 240);

    if (!normalizedQuestion) {
      setAssistantAnswer("Choose a quick question or type what you want to know.");
      return;
    }

    setAssistantQuestion(normalizedQuestion);
    setAssistantAnswer(buildTravelAssistantAnswer(normalizedQuestion, assistantDestination));
  };

  const submitAssistantQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    askAssistant(assistantQuestion);
  };

  const toggleFavorite = (destinationId: string) => {
    const nextIds = favoriteIds.includes(destinationId)
      ? favoriteIds.filter((id) => id !== destinationId)
      : [destinationId, ...favoriteIds];

    writeStoredIds(GUIDE_FAVORITES_KEY, nextIds);
  };

  const saveOffline = (destinationId: string) => {
    writeStoredIds(OFFLINE_DESTINATIONS_KEY, [destinationId, ...offlineIds]);
    setActionStatus("Saved offline");
  };

  const toggleSavedHotel = (hotelId: string) => {
    const nextIds = savedHotelIds.includes(hotelId)
      ? savedHotelIds.filter((id) => id !== hotelId)
      : [hotelId, ...savedHotelIds];

    writeStoredIds(SAVED_HOTELS_KEY, nextIds);
    setActionStatus(nextIds.includes(hotelId) ? "Hotel saved" : "Hotel removed");
  };

  const savePlannerRoute = () => {
    writeStoredIds(SAVED_ROUTES_KEY, [planner.id, ...savedRouteIds]);
    setActionStatus("Route saved");
  };

  const shareDestination = async (destination: GuideDestination) => {
    const shareUrl = `${window.location.origin}/locations/${destination.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: destination.name,
          text: destination.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setActionStatus("Link copied");
      }
    } catch {
      setActionStatus("Share cancelled");
    }
  };

  const openActions = (mode: ActionSheetMode) => {
    setActionSheetMode(mode);
  };

  const activateViewFromMenu = (view: GuideView) => {
    setActiveView(view);
    setActionSheetMode(null);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  return (
    <section className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-white/40">Mangystau Trails</p>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Guide</h2>
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-[20px] border border-white/10 bg-white/5 p-1">
          {guideViews.map((view) => (
            <button
              key={view.id}
              type="button"
              aria-pressed={activeView === view.id}
              onClick={() => setActiveView(view.id)}
              className={`min-h-10 rounded-[16px] px-2 text-xs font-semibold transition ${
                activeView === view.id
                  ? "bg-white text-black"
                  : "text-white/62 hover:bg-white/8 hover:text-white"
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card space-y-3 p-3 md:p-4">
        <label className="block">
          <span className="sr-only">Search</span>
          <input
            value={searchQuery}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setSearchQuery(nextQuery);

              if (nextQuery.toLowerCase().includes("hotel")) {
                setActiveView("hotels");
              }
            }}
            onFocus={() => {
              if (searchQuery.toLowerCase().includes("hotel")) {
                setActiveView("hotels");
              }
            }}
            placeholder="Search sunset, family, history, easy hike, hotels"
            className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f]/88 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip
            label="All"
            isActive={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          {guideFilters.map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              isActive={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            />
          ))}
        </div>
      </div>

      <TravelAssistantPanel
        destination={assistantDestination}
        question={assistantQuestion}
        answer={assistantAnswer}
        onQuestionChange={setAssistantQuestion}
        onSubmit={submitAssistantQuestion}
        onAsk={askAssistant}
      />

      {actionStatus ? (
        <p aria-live="polite" className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
          {actionStatus}
        </p>
      ) : null}

      {activeView === "guide" ? (
        <GuideGrid
          destinations={filteredDestinations}
          userCoordinates={userLocation.coordinates}
          onExplore={openDestination}
        />
      ) : null}

      {activeView === "hotels" ? (
        <HotelsPanel
          hotels={sortedHotels}
          sortMode={hotelSort}
          userCoordinates={userLocation.coordinates}
          savedHotelIds={savedHotelIds}
          isLocating={userLocation.isLocating}
          locationMessage={userLocation.locationMessage}
          onSortChange={setHotelSort}
          onRequestLocation={userLocation.openLocationModal}
          onRefreshLocation={userLocation.requestBrowserLocation}
          onToggleSavedHotel={toggleSavedHotel}
          onActionStatus={setActionStatus}
        />
      ) : null}

      {activeView === "planner" ? (
        <PlannerPanel
          duration={plannerDuration}
          theme={plannerTheme}
          planner={planner}
          onDurationChange={setPlannerDuration}
          onThemeChange={setPlannerTheme}
          onOpenDestination={openDestination}
          onSaveRoute={savePlannerRoute}
          isSaved={savedRouteIds.includes(planner.id)}
        />
      ) : null}

      {activeView === "favorites" ? (
        <FavoritesPanel
          destinations={favoriteDestinations}
          userCoordinates={userLocation.coordinates}
          onExplore={openDestination}
        />
      ) : null}

      <FloatingActions
        onOpenActions={() => openActions("actions")}
      />

      <BottomSheet
        isOpen={Boolean(selectedDestination)}
        title={selectedDestination?.name}
        onClose={() => setSelectedDestination(null)}
        footer={
          selectedDestination ? (
            <div className="grid grid-cols-3 gap-2">
              <a
                href={buildDestinationRouteUrl(selectedDestination, userLocation.coordinates ?? undefined)}
                target="_blank"
                rel="noreferrer"
                className="btn chat-button justify-center text-center"
              >
                Open Route
              </a>
              <button
                type="button"
                onClick={() => saveOffline(selectedDestination.id)}
                className="btn justify-center bg-white/5 text-white/80"
              >
                Save Offline
              </button>
              <button
                type="button"
                onClick={() => shareDestination(selectedDestination)}
                className="btn justify-center bg-white/5 text-white/80"
              >
                Share
              </button>
            </div>
          ) : null
        }
      >
        {selectedDestination ? (
          <GuideDetail
            destination={selectedDestination}
            userCoordinates={userLocation.coordinates}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        ) : null}
      </BottomSheet>

      <BottomSheet
        isOpen={Boolean(actionSheetMode)}
        title={actionSheetMode === "emergency" ? "Emergency" : "Quick actions"}
        onClose={() => setActionSheetMode(null)}
      >
        {actionSheetMode === "actions" ? (
          <div className="grid gap-2">
            <ActionButton label="Hotels" onClick={() => activateViewFromMenu("hotels")} />
            <Link href="/explore" className="btn chat-button justify-center text-center">
              Map
            </Link>
            <ActionButton label="Emergency" onClick={() => setActionSheetMode("emergency")} />
            <ActionButton label="Guide" onClick={() => activateViewFromMenu("guide")} />
            <ActionButton label="Favorites" onClick={() => activateViewFromMenu("favorites")} />
          </div>
        ) : null}

        {actionSheetMode === "emergency" ? <EmergencyPanel /> : null}
      </BottomSheet>

      <LocationPermissionModal
        isOpen={userLocation.isPermissionModalOpen}
        isLoading={userLocation.isLocating}
        onAllow={userLocation.requestBrowserLocation}
        onMaybeLater={userLocation.dismissLocationModal}
      />
    </section>
  );
}

function TravelAssistantPanel({
  destination,
  question,
  answer,
  onQuestionChange,
  onSubmit,
  onAsk,
}: {
  destination: GuideDestination;
  question: string;
  answer: string;
  onQuestionChange: (question: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAsk: (question: string) => void;
}) {
  return (
    <aside className="rounded-[20px] border border-white/10 bg-white/5 p-3 md:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Travel Assistant</p>
          <h3 className="mt-1 text-base font-semibold text-white">Plan around {destination.name}</h3>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
          Curated guide
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-white/48">
        Answers use the destination guide on this page, not live AI, weather or road feeds.
      </p>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {assistantQuickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onAsk(prompt)}
            className="btn shrink-0 bg-white/5 py-2 text-xs text-white/75"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Ask the travel assistant about {destination.name}</span>
          <input
            value={question}
            maxLength={240}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder={`Ask about ${destination.name}`}
            className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f]/88 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
          />
        </label>
        <button type="submit" className="btn chat-button justify-center sm:shrink-0">
          Get guide answer
        </button>
      </form>

      {answer ? (
        <p
          aria-live="polite"
          className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/68"
        >
          {answer}
        </p>
      ) : null}

      <p className="mt-2 text-[11px] leading-5 text-white/38">
        Confirm current weather and road conditions locally before remote travel.
      </p>
    </aside>
  );
}

function GuideGrid({
  destinations,
  userCoordinates,
  onExplore,
}: {
  destinations: GuideDestination[];
  userCoordinates: Coordinates | null;
  onExplore: (destination: GuideDestination) => void;
}) {
  if (destinations.length === 0) {
    return (
      <div className="glass-card p-4 text-sm text-white/60">
        No matching places yet. Try sunset, family, history or easy hike.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {destinations.map((destination, index) => (
        <motion.article
          key={destination.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02, duration: 0.18 }}
          className="grid grid-cols-[112px_1fr] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/9 sm:grid-cols-[136px_1fr]"
        >
          <div className="relative min-h-36 bg-white/5">
            <Image
              src={destination.image}
              alt={`${destination.name} photo`}
              fill
              sizes="(max-width: 640px) 112px, 136px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 p-3">
            <h3 className="min-w-0 truncate text-base font-semibold text-white">{destination.name}</h3>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/65">
              <QuickPill value={`${icon.star} ${destination.rating.toFixed(1)}`} />
              <QuickPill value={`${icon.pin} ${getDestinationDistance(destination, userCoordinates)}`} />
            </div>

            <button
              type="button"
              onClick={() => onExplore(destination)}
              className="btn chat-button mt-4 min-h-10 w-full justify-center py-2"
            >
              Explore
            </button>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function GuideDetail({
  destination,
  userCoordinates,
  favoriteIds,
  onToggleFavorite,
}: {
  destination: GuideDestination;
  userCoordinates: Coordinates | null;
  favoriteIds: string[];
  onToggleFavorite: (destinationId: string) => void;
}) {
  const hotels = getHotelsNearDestination(destination, 4) as HotelWithDistance[];
  const services = getServicesNearDestination(destination, 8) as ServiceWithDistance[];
  const isFavorite = favoriteIds.includes(destination.id);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">{destination.category}</p>
          <p className="mt-2 text-sm leading-6 text-white/68">{destination.description}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(destination.id)}
          className={`btn justify-center ${isFavorite ? "btn-active" : "bg-white/5 text-white/80"}`}
        >
          {isFavorite ? "Saved" : "Save"}
        </button>
      </div>

      <TravelGallery images={destination.gallery} title={destination.name} />

      <div className="grid grid-cols-5 gap-2 text-xs text-white/70">
        <QuickPill value={`${icon.star} ${destination.rating.toFixed(1)}`} />
        <QuickPill value={`${icon.clock} ${destination.travelTime}`} />
        <QuickPill value={`${icon.pin} ${getDestinationDistance(destination, userCoordinates)}`} />
        <QuickPill value={`${icon.car} ${destination.transportType}`} />
        <QuickPill value={`${icon.temp} ${destination.temperature}`} />
      </div>

      <Accordion title="Description" defaultOpen>
        <p>{destination.description}</p>
      </Accordion>

      <Accordion title="History">
        <p>{destination.story}</p>
      </Accordion>

      <Accordion title="Legends">
        <p>{destination.legend}</p>
      </Accordion>

      <Accordion title="Interesting facts">
        <CompactList items={destination.facts} />
      </Accordion>

      <Accordion title="What to take">
        <CompactList items={destination.whatToTake} />
      </Accordion>

      <Accordion title="Logistics">
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoRow label="Difficulty" value={destination.difficulty} />
          <InfoRow label="Transport" value={destination.transportType} />
          <InfoRow label="Best time" value={destination.bestSeason} />
          <InfoRow label="Weather" value={destination.weather} />
        </div>
      </Accordion>

      <Accordion title="Warnings">
        <CompactList items={destination.warnings} tone="warning" />
      </Accordion>

      <Accordion title="Nearby hotels">
        <div className="grid gap-2">
          {hotels.map((hotel) => (
            <SmallHotelRow key={hotel.id} hotel={hotel} origin={userCoordinates} />
          ))}
        </div>
      </Accordion>

      <Accordion title="Nearby services">
        <ServiceGroups services={services} />
      </Accordion>

      <Accordion title="Route">
        <p className="text-sm font-semibold text-white">{destination.routeTitle}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {destination.routePoints.map((point, index) => (
            <span
              key={point}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65"
            >
              {index + 1}. {point}
            </span>
          ))}
        </div>
      </Accordion>
    </div>
  );
}

function HotelsPanel({
  hotels,
  sortMode,
  userCoordinates,
  savedHotelIds,
  isLocating,
  locationMessage,
  onSortChange,
  onRequestLocation,
  onRefreshLocation,
  onToggleSavedHotel,
  onActionStatus,
}: {
  hotels: HotelWithDistance[];
  sortMode: HotelSortMode;
  userCoordinates: Coordinates | null;
  savedHotelIds: string[];
  isLocating: boolean;
  locationMessage: string;
  onSortChange: (mode: HotelSortMode) => void;
  onRequestLocation: () => void;
  onRefreshLocation: () => void;
  onToggleSavedHotel: (hotelId: string) => void;
  onActionStatus: (message: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/5 p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {hotelSortOptions.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              isActive={sortMode === option.id}
              onClick={() => onSortChange(option.id)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={userCoordinates ? onRefreshLocation : onRequestLocation}
          disabled={isLocating}
          className="btn chat-button justify-center disabled:opacity-60"
        >
          {isLocating ? "Locating..." : userCoordinates ? "Refresh" : "Use location"}
        </button>
      </div>

      {locationMessage ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/66">
          {locationMessage}
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            userCoordinates={userCoordinates}
            isSaved={savedHotelIds.includes(hotel.id)}
            onToggleSavedHotel={onToggleSavedHotel}
            onActionStatus={onActionStatus}
          />
        ))}
      </div>
    </div>
  );
}

function HotelCard({
  hotel,
  userCoordinates,
  isSaved,
  onToggleSavedHotel,
  onActionStatus,
}: {
  hotel: HotelWithDistance;
  userCoordinates: Coordinates | null;
  isSaved: boolean;
  onToggleSavedHotel: (hotelId: string) => void;
  onActionStatus: (message: string) => void;
}) {
  const routeUrl = buildGoogleMapsDirectionsUrl(hotel.coordinates, userCoordinates ?? undefined);
  const mapsUrl = buildMapsSearchUrl(hotel.coordinates);
  const distanceLabel = userCoordinates
    ? hotel.formattedDistanceFromUser ?? "Nearby"
    : `${formatDistanceKm(getHaversineDistanceKm(AKTAU_CENTER, hotel.coordinates))} from Aktau`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${hotel.name} - ${hotel.address}`);
      onActionStatus("Address copied");
    } catch {
      onActionStatus("Copy unavailable");
    }
  };

  return (
    <article className="grid grid-cols-[104px_1fr] overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
      <div className="relative min-h-36 bg-white/5">
        <Image
          src={hotel.image}
          alt={`${hotel.name} photo`}
          fill
          sizes="104px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 p-3">
        <h3 className="truncate text-base font-semibold text-white">{hotel.name}</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/65">
          <QuickPill value={`${icon.star} ${hotel.rating.toFixed(1)}`} />
          <QuickPill value={hotel.priceRange} />
          <QuickPill value={distanceLabel} />
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/52">{hotel.address}</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <a href={routeUrl} target="_blank" rel="noreferrer" className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Route
          </a>
          <button
            type="button"
            aria-pressed={isSaved}
            onClick={() => onToggleSavedHotel(hotel.id)}
            className={`btn min-h-9 justify-center px-2 py-2 text-xs ${isSaved ? "btn-active" : ""}`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            aria-label="Copy address"
            onClick={copyAddress}
            className="btn min-h-9 justify-center px-2 py-2 text-xs"
          >
            Address
          </button>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn min-h-9 justify-center px-2 py-2 text-xs">
            Maps
          </a>
        </div>
      </div>
    </article>
  );
}

function PlannerPanel({
  duration,
  theme,
  planner,
  onDurationChange,
  onThemeChange,
  onOpenDestination,
  onSaveRoute,
  isSaved,
}: {
  duration: PlannerDuration;
  theme: PlannerTheme;
  planner: PlannerPlan;
  onDurationChange: (duration: PlannerDuration) => void;
  onThemeChange: (theme: PlannerTheme) => void;
  onOpenDestination: (destination: GuideDestination) => void;
  onSaveRoute: () => void;
  isSaved: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="glass-card space-y-3 p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plannerDurations.map((option) => (
            <Chip
              key={option}
              label={option}
              isActive={duration === option}
              onClick={() => onDurationChange(option)}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plannerThemes.map((option) => (
            <Chip
              key={option}
              label={option}
              isActive={theme === option}
              onClick={() => onThemeChange(option)}
            />
          ))}
        </div>
      </div>

      <article className="rounded-[20px] border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">{planner.meta}</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{planner.title}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
            <a
              href={buildDestinationRouteUrl(planner.stops[planner.stops.length - 1])}
              target="_blank"
              rel="noreferrer"
              className="btn chat-button justify-center"
            >
              Open Route
            </a>
            <button
              type="button"
              aria-pressed={isSaved}
              onClick={onSaveRoute}
              className={`btn justify-center ${isSaved ? "btn-active" : "bg-white/5 text-white/80"}`}
            >
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {planner.days.map((day) => (
            <div key={day} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/68">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {planner.stops.map((destination, index) => (
            <button
              key={destination.id}
              type="button"
              onClick={() => onOpenDestination(destination)}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70"
            >
              {index + 1}. {destination.name}
            </button>
          ))}
        </div>
      </article>
    </div>
  );
}

function FavoritesPanel({
  destinations,
  userCoordinates,
  onExplore,
}: {
  destinations: GuideDestination[];
  userCoordinates: Coordinates | null;
  onExplore: (destination: GuideDestination) => void;
}) {
  if (destinations.length === 0) {
    return (
      <div className="glass-card p-4 text-sm text-white/60">
        Saved places will appear here after you tap save.
      </div>
    );
  }

  return (
    <GuideGrid
      destinations={destinations}
      userCoordinates={userCoordinates}
      onExplore={onExplore}
    />
  );
}

function FloatingActions({ onOpenActions }: { onOpenActions: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpenActions}
      aria-label="Open quick actions"
      className="fixed bottom-5 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white text-xl font-semibold text-black shadow-[0_18px_45px_rgba(0,0,0,0.38)] transition hover:scale-105 md:bottom-6 md:right-6"
    >
      +
    </button>
  );
}

function EmergencyPanel() {
  return (
    <div className="grid gap-3">
      {emergencyContacts.map((contact) => (
        <article key={contact.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-white">{contact.label}</h3>
            <a href={`tel:${contact.value.replace(/\s/g, "")}`} className="text-sm font-semibold text-white/80">
              {contact.value}
            </a>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/58">{contact.note}</p>
        </article>
      ))}
    </div>
  );
}

function ServiceGroups({ services }: { services: ServiceWithDistance[] }) {
  const groups: { label: string; types: NearbyService["type"][] }[] = [
    { label: "Nearby Restaurants", types: ["restaurant"] },
    { label: "Nearby Fuel", types: ["fuel"] },
    { label: "Nearby Toilets", types: ["toilet"] },
    { label: "Nearby Pharmacy", types: ["pharmacy", "medical"] },
    { label: "Nearby Services", types: ["transport", "airport", "camping"] },
  ];

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const matchingServices = services.filter((service) => group.types.includes(service.type));

        if (matchingServices.length === 0) {
          return null;
        }

        return (
          <div key={group.label} className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">{group.label}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {matchingServices.map((service) => (
                <article key={service.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{service.name}</h4>
                    {service.formattedDistanceFromUser ? (
                      <span className="text-xs text-white/50">{service.formattedDistanceFromUser}</span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/54">{service.note}</p>
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SmallHotelRow({ hotel, origin }: { hotel: HotelWithDistance; origin: Coordinates | null }) {
  const distanceLabel = hotel.formattedDistanceFromUser
    ? `${hotel.formattedDistanceFromUser} from destination`
    : origin
      ? formatDistanceKm(getHaversineDistanceKm(origin, hotel.coordinates))
      : hotel.cityArea;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-white">{hotel.name}</h4>
          <p className="mt-1 text-xs text-white/52">{hotel.priceRange}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/65">
          {hotel.rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-2 text-xs text-white/50">{distanceLabel}</p>
    </article>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white/66 open:bg-white/7"
    >
      <summary className="cursor-pointer list-none font-semibold text-white">{title}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function CompactList({ items, tone = "default" }: { items: string[]; tone?: "default" | "warning" }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span
            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
              tone === "warning" ? "bg-[#f59e0b]" : "bg-white/55"
            }`}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function QuickPill({ value }: { value: string }) {
  return (
    <span className="min-w-0 truncate rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-center">
      {value}
    </span>
  );
}

function Chip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`btn shrink-0 py-2 ${isActive ? "btn-active" : "bg-white/5 text-white/80"}`}
    >
      {label}
    </button>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn chat-button justify-center">
      {label}
    </button>
  );
}

function GuideAppFallback() {
  return (
    <div className="glass-card p-4 text-sm text-white/60">
      Preparing the local travel guide...
    </div>
  );
}

function getDestinationFromQuery(value: string | null) {
  if (!value) {
    return null;
  }

  const normalizedValue = normalizeDestinationToken(value);
  const aliases: Record<string, string> = {
    aktau: "aktau-seaside",
    "aktau-city": "aktau-seaside",
    "caspian-sea": "aktau-seaside",
  };
  const destinationId = aliases[normalizedValue] ?? normalizedValue;

  return (
    guideDestinations.find(
      (destination) =>
        destination.id === destinationId ||
        normalizeDestinationToken(destination.name) === destinationId
    ) ?? null
  );
}

function normalizeDestinationToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getLegacyPlannerSelection(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedPlan = parsePlannerRouteId(value);
  if (!parsedPlan) {
    return null;
  }

  for (const duration of plannerDurations) {
    for (const theme of plannerThemes) {
      if (buildPlanner(duration, theme).id === parsedPlan.id) {
        return { duration, theme };
      }
    }
  }

  return null;
}

function buildTravelAssistantAnswer(question: string, destination: GuideDestination) {
  const normalizedQuestion = question.toLowerCase();
  const responses: string[] = [];

  if (
    includesAny(normalizedQuestion, [
      "season",
      "weather",
      "when",
      "summer",
      "winter",
      "spring",
      "autumn",
      "fall",
      "сезон",
      "погод",
      "когда",
      "летом",
      "зимой",
      "весной",
      "осенью",
    ])
  ) {
    responses.push(
      `The guide's best window for ${destination.name} is ${destination.bestSeason}. Its seasonal profile is: ${destination.weather} This is planning guidance, not a live forecast.`
    );
  }

  if (
    includesAny(normalizedQuestion, [
      "road",
      "drive",
      "car",
      "transport",
      "route",
      "4x4",
      "suv",
      "дорог",
      "машин",
      "маршрут",
      "транспорт",
      "внедорож",
      "4х4",
    ])
  ) {
    responses.push(
      `The guide lists ${destination.travelTime} travel time, ${destination.transportType} transport and ${destination.difficulty.toLowerCase()} difficulty. ${destination.warnings[0] ?? "Keep a daylight buffer."} This is not live road-status data.`
    );
  }

  if (
    includesAny(normalizedQuestion, [
      "family",
      "kid",
      "child",
      "сем",
      "дет",
      "ребен",
      "ребён",
    ])
  ) {
    const familyGuidance = destination.filters.includes("family")
      ? `The curated guide marks ${destination.name} as a family option.`
      : `The curated guide does not mark ${destination.name} as a family route.`;

    responses.push(
      `${familyGuidance} Difficulty is ${destination.difficulty.toLowerCase()}; ${destination.warnings[0]?.toLowerCase() ?? "keep close supervision on uneven ground."}`
    );
  }

  if (
    includesAny(normalizedQuestion, [
      "pack",
      "equipment",
      "take",
      "wear",
      "water",
      "clothes",
      "взять",
      "экип",
      "одеж",
      "вод",
      "снаряж",
    ])
  ) {
    responses.push(
      `For ${destination.name}, the guide recommends: ${destination.whatToTake.slice(0, 5).join(", ")}. Adjust layers and reserves to the actual forecast and trip length.`
    );
  }

  if (
    includesAny(normalizedQuestion, [
      "safe",
      "safety",
      "danger",
      "warning",
      "risk",
      "безопас",
      "опас",
      "риск",
    ])
  ) {
    responses.push(`Key guide warnings: ${destination.warnings.join(" ")}`);
  }

  if (responses.length > 0) {
    return responses.join(" ");
  }

  return `${destination.description} Best guide season: ${destination.bestSeason}; suggested transport: ${destination.transportType}. Ask about season, roads, family suitability, packing or safety for a more focused answer.`;
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function getDestinationDistance(destination: GuideDestination, userCoordinates: Coordinates | null) {
  if (!userCoordinates) {
    return `${destination.distanceFromAktauKm} km`;
  }

  return formatDistanceKm(getHaversineDistanceKm(userCoordinates, destination.coordinates));
}

function getPriceFloor(priceRange: string) {
  const match = priceRange.match(/(\d[\d\s]*)/);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(match[1].replace(/\s/g, ""));
}

function buildMapsSearchUrl(coordinates: Coordinates) {
  const [lat, lng] = coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
