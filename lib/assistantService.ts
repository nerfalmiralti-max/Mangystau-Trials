import { GoogleGenAI, Type } from "@google/genai";
import { PLACES, ROUTES, type TravelPlace } from "@/lib/siteData";
import { POPULAR_MANGYSTAU_ROUTES, getPlaceTourism } from "@/lib/tourismData";
import type { AssistantResponse } from "@/lib/travelTypes";

export type AssistantLanguage = "ru" | "en";

export type AssistantHistoryItem = {
  role?: "assistant" | "traveler";
  text?: string;
};

export type AssistantRequestInput = {
  message: string;
  selectedPlaceId?: string;
  selectedPlace?: {
    id?: string;
    name?: string;
    category?: string;
    region?: string;
    coordinates?: number[];
    description?: string;
  } | null;
  tripContext?: Record<string, unknown> | null;
  history?: AssistantHistoryItem[];
  language: AssistantLanguage;
};

const geminiModel = "gemini-2.5-flash";
const configuredTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 20000);
const requestTimeoutMs = Number.isFinite(configuredTimeoutMs)
  ? Math.max(5000, configuredTimeoutMs)
  : 20000;

export class AssistantConfigurationError extends Error {
  constructor() {
    super(
      "Gemini AI assistant is not configured. Add the existing GEMINI_API_KEY variable to Vercel and local .env."
    );
    this.name = "AssistantConfigurationError";
  }
}

export class AssistantProviderError extends Error {
  constructor(message = "Gemini API is unavailable right now. Please try again in a moment.") {
    super(message);
    this.name = "AssistantProviderError";
  }
}

export async function askTravelAssistant(
  input: AssistantRequestInput
): Promise<{ answer: AssistantResponse; model: string }> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new AssistantConfigurationError();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: buildUserPrompt(input),
      config: {
        systemInstruction: buildSystemPrompt(input.language),
        responseMimeType: "application/json",
        responseSchema: assistantResponseSchema,
        temperature: 0.35,
        maxOutputTokens: 1200,
        abortSignal: controller.signal,
      },
    });

    const outputText = response.text?.trim();

    if (!outputText) {
      throw new AssistantProviderError("Gemini returned an empty response.");
    }

    const parsed = JSON.parse(outputText) as AssistantResponse;

    return {
      answer: normalizeAssistantResponse(parsed),
      model: geminiModel,
    };
  } catch (error) {
    if (error instanceof AssistantConfigurationError || error instanceof AssistantProviderError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AssistantProviderError("Gemini API timed out. Please try again.");
    }

    throw new AssistantProviderError(getProviderErrorMessage(error));
  } finally {
    clearTimeout(timeout);
  }
}

export function buildAssistantContext() {
  return {
    places: PLACES.map((place) => {
      const profile = getPlaceTourism(place);

      return {
        id: place.id,
        name: place.name,
        region: place.region,
        category: place.category,
        coordinates: place.coordinates,
        description: place.desc,
        duration: place.duration,
        bestTime: place.bestTime,
        rating: profile.rating,
        visitTime: profile.visitTime,
        distanceFromAktauKm: profile.distanceFromAktauKm,
        highlights: profile.highlights,
        touristTips: profile.touristTips,
        safetyTips: place.safetyTips ?? [],
      };
    }),
    routes: ROUTES.map((route) => ({
      id: route.id,
      title: route.title,
      days: route.days,
      distance: route.distance,
      placeIds: route.placeIds,
      description: route.description,
      steps: route.steps,
    })),
    popularMangystauRoutes: POPULAR_MANGYSTAU_ROUTES,
  };
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || "";
}

function buildSystemPrompt(language: AssistantLanguage) {
  const responseLanguage =
    language === "ru"
      ? "Respond in Russian."
      : "Respond in clear English.";

  return [
    "Ты - AI travel guide for Mangystau, Kazakhstan.",
    "Помогай туристам строить маршруты, объясняй достопримечательности, давай советы по безопасности, отелям, такси, погоде, дороге и offline-поездкам.",
    "Отвечай кратко, понятно и полезно.",
    "Не выдумывай опасные детали. Если данных нет - честно скажи, что это примерная информация.",
    "Use only the provided project context plus the traveler's question for places, coordinates, categories, route names, descriptions, visit duration, safety and transport notes.",
    "Help travelers choose places by interests, budget, transport, available time, weather sensitivity and road difficulty.",
    "Always explain why you recommend each place, offer practical alternatives when useful, and include safety warnings for remote desert travel.",
    "Do not invent live prices, weather, road closures, opening hours, hotels, taxi availability or guide availability. If something is live-changing, say what the traveler should verify.",
    "If the traveler uploaded a photo but no image bytes are present, do not claim visual recognition. Say that image analysis is being prepared and use project landmarks as likely reference points.",
    "Return only valid JSON that matches the response schema.",
    responseLanguage,
  ].join(" ");
}

function buildUserPrompt(input: AssistantRequestInput) {
  const selectedPlace = findSelectedPlace(input);
  const history = (input.history ?? [])
    .slice(-8)
    .map((item) => {
      const role = item.role === "traveler" ? "Traveler" : "Assistant";
      return `${role}: ${readText(item.text, 700)}`;
    })
    .filter((line) => line.trim().length > 0);

  return JSON.stringify(
    {
      travelerRequest: input.message,
      selectedPlace: selectedPlace ? serializePlace(selectedPlace) : null,
      selectedPlaceFromClient: input.selectedPlace ? sanitizeClientPlace(input.selectedPlace) : null,
      tripContext: sanitizeTripContext(input.tripContext),
      recentChat: history,
      projectContext: buildAssistantContext(),
      responseContract: {
        recommendedPlaces: "Use place ids from projectContext.places.",
        routePlan: "For 1/2/3 day route requests, build realistic steps and stops from projectContext.",
        warnings: "Include remote-road, heat, water, 4x4 or weather cautions when relevant.",
        transportTips: "Mention car, 4x4, local driver-guide, distance or city logistics when relevant.",
      },
    },
    null,
    2
  );
}

function findSelectedPlace(input: AssistantRequestInput) {
  const selectedId = input.selectedPlaceId || input.selectedPlace?.id || "";
  const byId = PLACES.find((place) => place.id === selectedId);

  if (byId) {
    return byId;
  }

  const selectedName = input.selectedPlace?.name?.toLowerCase().trim();
  return selectedName
    ? PLACES.find((place) => place.name.toLowerCase() === selectedName)
    : undefined;
}

function sanitizeClientPlace(place: NonNullable<AssistantRequestInput["selectedPlace"]>) {
  return {
    id: readText(place.id, 120),
    name: readText(place.name, 120),
    category: readText(place.category, 80),
    region: readText(place.region, 120),
    coordinates: Array.isArray(place.coordinates)
      ? place.coordinates.slice(0, 2).map((value) => Number(value)).filter(Number.isFinite)
      : [],
    description: readText(place.description, 320),
  };
}

function sanitizeTripContext(context: AssistantRequestInput["tripContext"]) {
  if (!context || typeof context !== "object") {
    return null;
  }

  return JSON.parse(JSON.stringify(context, (_key, value) => {
    if (typeof value === "string") {
      return readText(value, 500);
    }

    if (typeof value === "number" || typeof value === "boolean" || value === null) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.slice(0, 12);
    }

    if (typeof value === "object") {
      return value;
    }

    return undefined;
  }));
}

function serializePlace(place: TravelPlace) {
  const profile = getPlaceTourism(place);

  return {
    id: place.id,
    name: place.name,
    region: place.region,
    category: place.category,
    coordinates: place.coordinates,
    description: place.desc,
    duration: place.duration,
    bestTime: place.bestTime,
    rating: profile.rating,
    visitTime: profile.visitTime,
    touristTips: profile.touristTips,
  };
}

function normalizeAssistantResponse(value: AssistantResponse): AssistantResponse {
  const stops = Array.isArray(value.routePlan?.stops) ? value.routePlan.stops : [];
  const steps = Array.isArray(value.routePlan?.steps) ? value.routePlan.steps : [];

  return {
    recommendedPlaces: Array.isArray(value.recommendedPlaces)
      ? value.recommendedPlaces.slice(0, 5)
      : [],
    routePlan: {
      title: readText(value.routePlan?.title, 120) || "Mangystau route plan",
      days: Number.isFinite(value.routePlan?.days) ? value.routePlan.days : 1,
      difficulty: readText(value.routePlan?.difficulty, 80) || "Moderate",
      stops: stops.slice(0, 8).map((stop) => ({
        id: readText(stop.id, 80),
        name: readText(stop.name, 120),
        coordinates: Array.isArray(stop.coordinates)
          ? ([Number(stop.coordinates[0]), Number(stop.coordinates[1])] as [number, number])
          : [43.653, 51.197],
        note: readText(stop.note, 240),
      })),
      steps: steps.map((step) => readText(step, 260)).filter(Boolean).slice(0, 8),
    },
    explanation: readText(value.explanation, 1200),
    warnings: Array.isArray(value.warnings)
      ? value.warnings.map((warning) => readText(warning, 220)).filter(Boolean).slice(0, 6)
      : [],
    estimatedTime: readText(value.estimatedTime, 120),
    transportTips: Array.isArray(value.transportTips)
      ? value.transportTips.map((tip) => readText(tip, 220)).filter(Boolean).slice(0, 6)
      : [],
  };
}

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

function getProviderErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = String(error.message);
    return message.length > 180 ? `${message.slice(0, 177)}...` : message;
  }

  return "Gemini API is unavailable right now. Please try again in a moment.";
}

const assistantResponseSchema = {
  type: Type.OBJECT,
  properties: {
    recommendedPlaces: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["id", "name", "category", "reason"],
      },
    },
    routePlan: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        days: { type: Type.NUMBER },
        difficulty: { type: Type.STRING },
        stops: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              coordinates: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
              },
              note: { type: Type.STRING },
            },
            required: ["id", "name", "coordinates", "note"],
          },
        },
        steps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["title", "days", "difficulty", "stops", "steps"],
    },
    explanation: { type: Type.STRING },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    estimatedTime: { type: Type.STRING },
    transportTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "recommendedPlaces",
    "routePlan",
    "explanation",
    "warnings",
    "estimatedTime",
    "transportTips",
  ],
};
