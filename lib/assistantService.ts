import { ApiError, GoogleGenAI, Type } from "@google/genai";
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

export type AssistantErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "QUOTA_OR_RATE_LIMIT"
  | "NETWORK_ERROR"
  | "GEMINI_TIMEOUT"
  | "GEMINI_EMPTY_RESPONSE"
  | "GEMINI_BAD_RESPONSE"
  | "GEMINI_SDK_ERROR";

const geminiModel = "gemini-2.5-flash";
const configuredTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 20000);
const requestTimeoutMs = Number.isFinite(configuredTimeoutMs)
  ? Math.max(5000, configuredTimeoutMs)
  : 20000;

export class AssistantConfigurationError extends Error {
  code: AssistantErrorCode;

  constructor() {
    super(
      "Gemini AI assistant is not configured. Add the existing GEMINI_API_KEY variable to Vercel and local .env."
    );
    this.name = "AssistantConfigurationError";
    this.code = "MISSING_API_KEY";
  }
}

export class AssistantProviderError extends Error {
  code: AssistantErrorCode;
  providerMessage: string;
  retryable: boolean;
  status?: number;

  constructor({
    code,
    providerMessage,
    retryable,
    status,
    publicMessage = "Gemini API is unavailable right now. Please try again in a moment.",
  }: {
    code: AssistantErrorCode;
    providerMessage: string;
    retryable: boolean;
    status?: number;
    publicMessage?: string;
  }) {
    super(publicMessage);
    this.name = "AssistantProviderError";
    this.code = code;
    this.providerMessage = providerMessage;
    this.retryable = retryable;
    this.status = status;
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
        systemInstruction: buildGeminiSystemPrompt(input.language),
        responseMimeType: "application/json",
        responseSchema: assistantResponseSchema,
        temperature: 0.35,
        maxOutputTokens: 1200,
        abortSignal: controller.signal,
      },
    });

    const outputText = response.text?.trim();

    if (!outputText) {
      throw new AssistantProviderError({
        code: "GEMINI_EMPTY_RESPONSE",
        providerMessage: "Gemini returned an empty response.",
        retryable: true,
      });
    }

    let parsed: AssistantResponse;

    try {
      parsed = JSON.parse(outputText) as AssistantResponse;
    } catch {
      throw new AssistantProviderError({
        code: "GEMINI_BAD_RESPONSE",
        providerMessage: "Gemini returned non-JSON content for the structured response.",
        retryable: true,
      });
    }

    return {
      answer: normalizeAssistantResponse(parsed),
      model: geminiModel,
    };
  } catch (error) {
    if (error instanceof AssistantConfigurationError || error instanceof AssistantProviderError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AssistantProviderError({
        code: "GEMINI_TIMEOUT",
        providerMessage: "Gemini API request timed out.",
        retryable: true,
        publicMessage: "Gemini API timed out. Please try again.",
      });
    }

    throw classifyGeminiError(error);
  } finally {
    clearTimeout(timeout);
  }
}

export function getAssistantErrorLog(error: unknown) {
  if (error instanceof AssistantConfigurationError) {
    return {
      code: error.code,
      status: 503,
      retryable: false,
      reason: "GEMINI_API_KEY is missing in the server environment.",
    };
  }

  if (error instanceof AssistantProviderError) {
    return {
      code: error.code,
      status: error.status ?? null,
      retryable: error.retryable,
      reason: error.providerMessage,
    };
  }

  return {
    code: "GEMINI_SDK_ERROR" satisfies AssistantErrorCode,
    status: null,
    retryable: true,
    reason: getProviderErrorMessage(error),
  };
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

function buildGeminiSystemPrompt(language: AssistantLanguage) {
  const responseLanguage =
    language === "ru"
      ? "Respond in Russian."
      : "Respond in clear English.";

  return [
    "You are an AI travel guide for Mangystau, Kazakhstan.",
    "Help travelers build routes, understand landmarks, and get practical safety, hotel, taxi, weather, road and offline-trip advice.",
    "Answer briefly, clearly and usefully.",
    "Do not invent dangerous details. If project data is missing, say the information is approximate.",
    "Use only the provided project context plus the traveler's question for places, coordinates, categories, route names, descriptions, visit duration, safety and transport notes.",
    "Help travelers choose places by interests, budget, transport, available time, weather sensitivity and road difficulty.",
    "Always explain why you recommend each place, offer practical alternatives when useful, and include safety warnings for remote desert travel.",
    "Do not invent live prices, weather, road closures, opening hours, hotels, taxi availability or guide availability. If something is live-changing, say what the traveler should verify.",
    "If the traveler uploaded a photo but no image bytes are present, do not claim visual recognition. Say that image analysis is being prepared and use project landmarks as likely reference points.",
    "Return only valid JSON that matches the response schema.",
    responseLanguage,
  ].join(" ");
}

export function buildSystemPrompt(language: AssistantLanguage) {
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

function classifyGeminiError(error: unknown): AssistantProviderError {
  const status = getErrorStatus(error);
  const providerMessage = getProviderErrorMessage(error);
  const lowerMessage = providerMessage.toLowerCase();

  if (
    status === 400 &&
    (lowerMessage.includes("api key") ||
      lowerMessage.includes("apikey") ||
      lowerMessage.includes("key not valid"))
  ) {
    return new AssistantProviderError({
      code: "INVALID_API_KEY",
      status,
      providerMessage,
      retryable: false,
      publicMessage: "Gemini API key is invalid.",
    });
  }

  if (status === 401 || status === 403) {
    return new AssistantProviderError({
      code: "INVALID_API_KEY",
      status,
      providerMessage,
      retryable: false,
      publicMessage: "Gemini API key is invalid or does not have access.",
    });
  }

  if (
    status === 429 ||
    lowerMessage.includes("quota") ||
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("resource_exhausted")
  ) {
    return new AssistantProviderError({
      code: "QUOTA_OR_RATE_LIMIT",
      status,
      providerMessage,
      retryable: true,
      publicMessage: "Gemini quota or rate limit was reached.",
    });
  }

  if (isNetworkError(error, lowerMessage)) {
    return new AssistantProviderError({
      code: "NETWORK_ERROR",
      status,
      providerMessage,
      retryable: true,
      publicMessage: "Network error while contacting Gemini API.",
    });
  }

  return new AssistantProviderError({
    code: "GEMINI_SDK_ERROR",
    status,
    providerMessage,
    retryable: status === undefined || status >= 500,
  });
}

function getErrorStatus(error: unknown) {
  if (error instanceof ApiError) {
    return error.status;
  }

  if (typeof error === "object" && error !== null) {
    const maybeStatus = "status" in error ? Number(error.status) : NaN;
    const maybeStatusCode = "statusCode" in error ? Number(error.statusCode) : NaN;

    if (Number.isFinite(maybeStatus)) {
      return maybeStatus;
    }

    if (Number.isFinite(maybeStatusCode)) {
      return maybeStatusCode;
    }
  }

  return undefined;
}

function isNetworkError(error: unknown, lowerMessage: string) {
  if (error instanceof TypeError && lowerMessage.includes("fetch")) {
    return true;
  }

  if (typeof error === "object" && error !== null && "name" in error) {
    const name = String(error.name).toLowerCase();

    if (name.includes("connection") || name.includes("network") || name.includes("fetch")) {
      return true;
    }
  }

  return [
    "fetch failed",
    "network",
    "enotfound",
    "econnreset",
    "etimedout",
    "socket",
  ].some((needle) => lowerMessage.includes(needle));
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
