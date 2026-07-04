"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import {
  defaultAssistantPlaceId,
  emergencyContacts,
  getAssistantPlaceById,
  getPreparedItinerary,
  getStayOptions,
  travelAssistantPlaces,
  type PreparedItinerary,
  type TravelAssistantPlace,
  type TravelAssistantPlaceId,
  type TravelAssistantScenario,
  type TripBudget,
  type TripDuration,
  type TripInterest,
} from "@/lib/travelAssistantData";

type PhotoUploadState = {
  previewUrl: string;
  fileName: string;
};

const scenarioButtons: { id: TravelAssistantScenario; label: string; description: string }[] = [
  { id: "route", label: "Build route", description: "Ready routes from Aktau" },
  { id: "hotels", label: "Find hotels", description: "Demo stays and camps" },
  { id: "taxi", label: "Taxi & transport", description: "Copy, navigate and open inDrive" },
  { id: "safety", label: "Safety tips", description: "Road and emergency basics" },
  { id: "offline", label: "Offline pack", description: "What to save before departure" },
  { id: "planner", label: "Trip planner", description: "Prepared itinerary by inputs" },
];

const durationOptions: { id: TripDuration; label: string }[] = [
  { id: "1-day", label: "1 day" },
  { id: "2-days", label: "2 days" },
  { id: "weekend", label: "Weekend" },
];

const budgetOptions: { id: TripBudget; label: string }[] = [
  { id: "budget", label: "Budget" },
  { id: "standard", label: "Standard" },
  { id: "comfort", label: "Comfort" },
];

const interestOptions: { id: TripInterest; label: string }[] = [
  { id: "nature", label: "Nature" },
  { id: "history", label: "History" },
  { id: "family", label: "Family" },
  { id: "extreme", label: "Extreme" },
];

const suvWarningText = '⚠️ "Для этого маршрута рекомендуется внедорожник (SUV)."';
const inDriveWebsiteUrl = "https://indrive.com/";

export default function ChatPage() {
  const [activeScenario, setActiveScenario] = useState<TravelAssistantScenario>("route");
  const [selectedPlaceId, setSelectedPlaceId] =
    useState<TravelAssistantPlaceId>(defaultAssistantPlaceId);
  const [tripDuration, setTripDuration] = useState<TripDuration>("2-days");
  const [tripBudget, setTripBudget] = useState<TripBudget>("standard");
  const [tripInterest, setTripInterest] = useState<TripInterest>("nature");
  const [photoUpload, setPhotoUpload] = useState<PhotoUploadState | null>(null);
  const [selectedPhotoPlaceId, setSelectedPhotoPlaceId] =
    useState<TravelAssistantPlaceId>("bozzhyra");
  const [actionStatus, setActionStatus] = useState("");

  const selectedPlace = useMemo(
    () => getAssistantPlaceById(selectedPlaceId) ?? travelAssistantPlaces[0],
    [selectedPlaceId]
  );
  const itinerary = useMemo(
    () => getPreparedItinerary(tripDuration, tripBudget, tripInterest),
    [tripBudget, tripDuration, tripInterest]
  );

  useEffect(() => {
    const placeFromQuery = new URLSearchParams(window.location.search).get("place");
    const matchedPlace = getAssistantPlaceById(placeFromQuery);

    if (matchedPlace) {
      const frameId = window.requestAnimationFrame(() => {
        setSelectedPlaceId(matchedPlace.id);
        setSelectedPhotoPlaceId(matchedPlace.id);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    return undefined;
  }, []);

  useEffect(() => {
    return () => {
      if (photoUpload?.previewUrl) {
        URL.revokeObjectURL(photoUpload.previewUrl);
      }
    };
  }, [photoUpload?.previewUrl]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoUpload({
      previewUrl: URL.createObjectURL(file),
      fileName: file.name,
    });
    setActionStatus("");
    event.target.value = "";
  };

  const clearPhotoUpload = () => {
    setPhotoUpload(null);
    setActionStatus("");
  };

  const copyDestination = async () => {
    const destinationText = `${selectedPlace.name} - ${selectedPlace.coordinates[0].toFixed(5)}, ${selectedPlace.coordinates[1].toFixed(5)}`;

    try {
      await navigator.clipboard.writeText(destinationText);
      setActionStatus("Destination copied");
    } catch {
      setActionStatus("Copy is unavailable in this browser");
    }
  };

  const openInDrive = () => {
    const destination = encodeURIComponent(
      `${selectedPlace.name} ${selectedPlace.coordinates[0]},${selectedPlace.coordinates[1]}`
    );
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    setActionStatus("Opening inDrive demo link");

    if (isMobile) {
      window.location.href = `indrive://?destination=${destination}`;
      window.setTimeout(() => {
        window.location.href = inDriveWebsiteUrl;
      }, 900);
      return;
    }

    window.open(inDriveWebsiteUrl, "_blank", "noopener,noreferrer");
  };

  const openNavigation = () => {
    const [lat, lng] = selectedPlace.coordinates;
    const encodedName = encodeURIComponent(selectedPlace.name);
    const isAppleDevice = /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent);
    const navigationUrl = isAppleDevice
      ? `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    window.open(navigationUrl, "_blank", "noopener,noreferrer");
  };

  const requestSuvTour = () => {
    setActionStatus(`Demo SUV tour request prepared for ${selectedPlace.name}`);
  };

  const prepareOfflinePack = () => {
    setActionStatus(`Offline pack prepared for ${selectedPlace.name}`);
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="chat" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-8 md:space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text="Smart Travel Assistant" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Choose a travel scenario and get ready route, transport, safety and offline planning
              cards for Mangystau without paid API calls.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card p-4 md:p-5">
              <div className="mb-5 flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible">
                {scenarioButtons.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => {
                      setActiveScenario(scenario.id);
                      setActionStatus("");
                    }}
                    className={`btn min-w-[178px] text-left md:min-w-0 ${
                      activeScenario === scenario.id ? "btn-active" : "bg-white/5 text-white/80"
                    }`}
                  >
                    <span className="block text-sm">{scenario.label}</span>
                    <span className="mt-1 block text-xs font-normal opacity-60">
                      {scenario.description}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_auto] md:items-end md:rounded-3xl">
                <label className="block space-y-2">
                  <span className="text-sm text-white/60">Selected attraction</span>
                  <select
                    value={selectedPlaceId}
                    onChange={(event) => {
                      setSelectedPlaceId(event.target.value as TravelAssistantPlaceId);
                      setActionStatus("");
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                  >
                    {travelAssistantPlaces.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="space-y-2 text-sm text-white/55 md:text-right">
                  <div>Current focus: {selectedPlace.name}</div>
                  <div>{selectedPlace.estimatedTime}</div>
                </div>
              </div>

              {actionStatus ? (
                <p
                  aria-live="polite"
                  className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/75"
                >
                  {actionStatus}
                </p>
              ) : null}

              <motion.div
                key={activeScenario}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="min-h-[340px] space-y-4 md:min-h-[440px]"
              >
                {activeScenario === "route" ? (
                  <RouteScenario places={travelAssistantPlaces} onSelect={setSelectedPlaceId} />
                ) : null}

                {activeScenario === "hotels" ? (
                  <HotelsScenario selectedPlace={selectedPlace} />
                ) : null}

                {activeScenario === "taxi" ? (
                  <TaxiScenario
                    selectedPlace={selectedPlace}
                    onCopyDestination={copyDestination}
                    onOpenInDrive={openInDrive}
                    onNavigate={openNavigation}
                    onRequestSuvTour={requestSuvTour}
                  />
                ) : null}

                {activeScenario === "safety" ? (
                  <SafetyScenario selectedPlace={selectedPlace} />
                ) : null}

                {activeScenario === "offline" ? (
                  <OfflinePackScenario
                    selectedPlace={selectedPlace}
                    onPrepareOfflinePack={prepareOfflinePack}
                  />
                ) : null}

                {activeScenario === "planner" ? (
                  <TripPlannerScenario
                    duration={tripDuration}
                    budget={tripBudget}
                    interest={tripInterest}
                    itinerary={itinerary}
                    onDurationChange={setTripDuration}
                    onBudgetChange={setTripBudget}
                    onInterestChange={setTripInterest}
                  />
                ) : null}
              </motion.div>
            </div>

            <div className="space-y-5">
              <PhotoGuide
                photoUpload={photoUpload}
                selectedPhotoPlaceId={selectedPhotoPlaceId}
                onPhotoChange={handlePhotoChange}
                onClearPhoto={clearPhotoUpload}
                onSelectPhotoPlace={setSelectedPhotoPlaceId}
              />

              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Known places</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {travelAssistantPlaces.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlaceId(place.id);
                        setActionStatus("");
                      }}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        selectedPlaceId === place.id
                          ? "border-white/20 bg-white text-black"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {place.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Emergency demo</p>
                <div className="mt-5 grid gap-3">
                  {emergencyContacts.map((contact) => (
                    <div
                      key={contact.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-white">{contact.label}</p>
                        <p className="text-sm text-white/70">{contact.value}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/55">{contact.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function RouteScenario({
  places,
  onSelect,
}: {
  places: TravelAssistantPlace[];
  onSelect: (placeId: TravelAssistantPlaceId) => void;
}) {
  return (
    <div className="grid gap-4">
      {places.map((place) => (
        <article key={place.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 md:rounded-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">{place.label}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{place.routeTitle}</h3>
            </div>
            <button type="button" onClick={() => onSelect(place.id)} className="btn chat-button sm:shrink-0">
              Use route
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/62">{place.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InfoTile label="Distance" value={`${place.distanceFromAktauKm} km`} />
            <InfoTile label="Time" value={place.estimatedTime} />
            <InfoTile label="Road" value={place.roadDifficulty} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {place.routePoints.map((point, index) => (
              <span key={`${place.id}-${point}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
                {index + 1}. {point}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function HotelsScenario({ selectedPlace }: { selectedPlace: TravelAssistantPlace }) {
  const stays = getStayOptions(selectedPlace.id);

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Find hotels"
        title={`Demo stays near ${selectedPlace.name}`}
        description="These cards are prepared demo data and can be connected to booking partners later."
      />
      <div className="grid gap-3">
        {stays.map((stay) => (
          <article key={`${stay.placeId}-${stay.name}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">{stay.type}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{stay.name}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                {stay.price}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/62">{stay.distance}</p>
            <p className="mt-2 text-sm leading-6 text-white/55">{stay.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function TaxiScenario({
  selectedPlace,
  onCopyDestination,
  onOpenInDrive,
  onNavigate,
  onRequestSuvTour,
}: {
  selectedPlace: TravelAssistantPlace;
  onCopyDestination: () => void;
  onOpenInDrive: () => void;
  onNavigate: () => void;
  onRequestSuvTour: () => void;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Taxi & Transport"
        title={`Transport to ${selectedPlace.name}`}
        description="Demo estimates with buttons prepared for future taxi or partner integrations."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile label="Price demo" value={selectedPlace.taxi.estimatedPrice} />
        <InfoTile label="Wait" value={selectedPlace.taxi.waitingTime} />
        <InfoTile label="Distance" value={`${selectedPlace.distanceFromAktauKm} km`} />
      </div>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4 md:rounded-3xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="Transport" value={selectedPlace.recommendedTransport} />
          <InfoTile label="Road difficulty" value={selectedPlace.roadDifficulty} />
        </div>
        <p className="mt-4 text-sm leading-6 text-white/62">{selectedPlace.taxi.demoDriverNote}</p>
        {!selectedPlace.ordinaryCarAccess ? (
          <p className="mt-4 rounded-2xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 p-4 text-sm leading-6 text-white">
            {suvWarningText}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={onOpenInDrive} className="btn chat-button">
            Open inDrive
          </button>
          <button type="button" onClick={onCopyDestination} className="btn bg-white/5 text-white/80">
            Copy destination
          </button>
          <button type="button" onClick={onNavigate} className="btn bg-white/5 text-white/80">
            Navigate
          </button>
          {selectedPlace.hardToAccess ? (
            <button type="button" onClick={onRequestSuvTour} className="btn bg-white/5 text-white/80">
              Book SUV Tour
            </button>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function SafetyScenario({ selectedPlace }: { selectedPlace: TravelAssistantPlace }) {
  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Safety tips"
        title={`Before visiting ${selectedPlace.name}`}
        description="Road, heat, water and emergency notes for the selected destination."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {selectedPlace.safetyTips.map((tip) => (
          <InfoCard key={tip} title="Safety" text={tip} />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {emergencyContacts.map((contact) => (
          <InfoCard key={contact.label} title={`${contact.label}: ${contact.value}`} text={contact.note} />
        ))}
      </div>
    </div>
  );
}

function OfflinePackScenario({
  selectedPlace,
  onPrepareOfflinePack,
}: {
  selectedPlace: TravelAssistantPlace;
  onPrepareOfflinePack: () => void;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Offline pack"
        title={`Save before ${selectedPlace.name}`}
        description="A compact checklist for offline travel in remote Mangystau areas."
      />
      <div className="grid gap-3 md:grid-cols-2">
        <ChecklistCard title="What to take" items={selectedPlace.packingList} />
        <ChecklistCard title="What to save" items={selectedPlace.offlinePack} />
      </div>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Route points</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedPlace.routePoints.map((point, index) => (
            <span key={point} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
              {index + 1}. {point}
            </span>
          ))}
        </div>
        <button type="button" onClick={onPrepareOfflinePack} className="btn chat-button mt-4">
          Prepare offline pack
        </button>
      </article>
    </div>
  );
}

function TripPlannerScenario({
  duration,
  budget,
  interest,
  itinerary,
  onDurationChange,
  onBudgetChange,
  onInterestChange,
}: {
  duration: TripDuration;
  budget: TripBudget;
  interest: TripInterest;
  itinerary: PreparedItinerary;
  onDurationChange: (duration: TripDuration) => void;
  onBudgetChange: (budget: TripBudget) => void;
  onInterestChange: (interest: TripInterest) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Trip planner"
        title="Prepared itinerary"
        description="Choose duration, budget and interest to receive a ready demo plan."
      />
      <PlannerButtonGroup
        label="Duration"
        options={durationOptions}
        value={duration}
        onChange={onDurationChange}
      />
      <PlannerButtonGroup label="Budget" options={budgetOptions} value={budget} onChange={onBudgetChange} />
      <PlannerButtonGroup
        label="Interest"
        options={interestOptions}
        value={interest}
        onChange={onInterestChange}
      />
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4 md:rounded-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">{itinerary.transport}</p>
        <h3 className="mt-2 text-xl font-semibold text-white">{itinerary.title}</h3>
        <p className="mt-3 text-sm leading-6 text-white/62">{itinerary.summary}</p>
        <div className="mt-4 grid gap-3">
          {itinerary.days.map((day) => (
            <div key={day} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {itinerary.stops.map((placeId, index) => {
            const place = getAssistantPlaceById(placeId);
            return place ? (
              <span key={place.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
                {index + 1}. {place.name}
              </span>
            ) : null;
          })}
        </div>
      </article>
    </div>
  );
}

function PhotoGuide({
  photoUpload,
  selectedPhotoPlaceId,
  onPhotoChange,
  onClearPhoto,
  onSelectPhotoPlace,
}: {
  photoUpload: PhotoUploadState | null;
  selectedPhotoPlaceId: TravelAssistantPlaceId;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearPhoto: () => void;
  onSelectPhotoPlace: (placeId: TravelAssistantPlaceId) => void;
}) {
  const selectedPhotoPlace = getAssistantPlaceById(selectedPhotoPlaceId) ?? travelAssistantPlaces[0];

  return (
    <div className="glass-card p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-white/40">Ask by Photo</p>
      <h3 className="mt-3 text-2xl font-semibold">Photo guide demo</h3>
      <p className="mt-3 text-sm leading-6 text-white/60">
        Upload a photo preview and choose the place manually.
      </p>

      {photoUpload ? (
        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:rounded-3xl">
          <div
            aria-label={`Preview of ${photoUpload.fileName}`}
            className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 bg-cover bg-center"
            style={{ backgroundImage: `url(${photoUpload.previewUrl})` }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">Photo guide demo: choose the place manually</p>
            <p className="mt-1 truncate text-sm text-white/55">{photoUpload.fileName}</p>
          </div>
          <button type="button" onClick={onClearPhoto} className="btn bg-white/5 text-white/80">
            Remove
          </button>
        </div>
      ) : null}

      <label className="btn chat-button mt-5 w-full cursor-pointer justify-center text-center">
        Upload photo
        <input type="file" accept="image/*" onChange={onPhotoChange} className="sr-only" />
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        {travelAssistantPlaces.map((place) => (
          <button
            key={place.id}
            type="button"
            onClick={() => onSelectPhotoPlace(place.id)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              selectedPhotoPlaceId === place.id
                ? "border-white/20 bg-white text-black"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {place.name}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">{selectedPhotoPlace.name}</p>
        <p className="mt-2 text-sm leading-6 text-white/62">{selectedPhotoPlace.description}</p>
        <p className="mt-3 text-xs text-white/42">
          {selectedPhotoPlace.category} / {selectedPhotoPlace.estimatedTime}
        </p>
      </div>
    </div>
  );
}

function PlannerButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`btn shrink-0 ${value === option.id ? "btn-active" : "bg-white/5 text-white/80"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-white/68">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
    </article>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
      <p className="text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.24em] text-white/40">{eyebrow}</p>
      <h3 className="mt-3 text-xl font-semibold md:text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/62">{description}</p>
    </div>
  );
}
