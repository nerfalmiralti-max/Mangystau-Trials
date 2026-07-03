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
  history?: AssistantHistoryItem[];
  language: AssistantLanguage;
};

type OpenAIResponsePayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

const defaultModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const configuredTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 20000);
const requestTimeoutMs = Number.isFinite(configuredTimeoutMs)
  ? Math.max(5000, configuredTimeoutMs)
  : 20000;

export class AssistantConfigurationError extends Error {
  constructor() {
    super(
      "AI assistant is not configured. Add OPENAI_API_KEY to .env locally and to Vercel Environment Variables."
    );
    this.name = "AssistantConfigurationError";
  }
}

export class AssistantProviderError extends Error {
  constructor(message = "AI provider is unavailable right now. Please try again in a moment.") {
    super(message);
    this.name = "AssistantProviderError";
  }
}

export async function askTravelAssistant(
  input: AssistantRequestInput
): Promise<{ answer: AssistantResponse; model: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new AssistantConfigurationError();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: defaultModel,
        instructions: buildSystemPrompt(input.language),
        input: buildUserPrompt(input),
        temperature: 0.35,
        max_output_tokens: 1200,
        text: {
          format: {
            type: "json_schema",
            name: "mangystau_tourist_assistant_response",
            strict: true,
            schema: assistantResponseSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new AssistantProviderError(`AI provider returned ${response.status}.`);
    }

    const outputText = getOutputText((await response.json()) as OpenAIResponsePayload);
    const parsed = JSON.parse(outputText) as AssistantResponse;

    return {
      answer: normalizeAssistantResponse(parsed),
      model: defaultModel,
    };
  } catch (error) {
    if (error instanceof AssistantConfigurationError || error instanceof AssistantProviderError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AssistantProviderError("AI provider timed out. Please try again.");
    }

    throw new AssistantProviderError();
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

function buildSystemPrompt(language: AssistantLanguage) {
  const responseLanguage =
    language === "ru"
      ? "Respond in Russian."
      : "Respond in clear English.";

  return [
    "You are a real AI tourist assistant for MangystauTrails.",
    "Use only the provided project context for places, coordinates, route names, descriptions, visit duration, safety and transport notes.",
    "Help travelers choose places by interests, budget, transport, available time, weather sensitivity and road difficulty.",
    "Always explain why you recommend each place, offer practical alternatives when useful, and include safety warnings for remote desert travel.",
    "Do not invent live prices, weather, road closures or guide availability. If something is live-changing, say what the traveler should verify.",
    "Return only valid JSON that matches the schema.",
    responseLanguage,
  ].join(" ");
}

function buildUserPrompt(input: AssistantRequestInput) {
  const selectedPlace = PLACES.find((place) => place.id === input.selectedPlaceId);
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

function getOutputText(data: OpenAIResponsePayload) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .join("\n")
    .trim();
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

const assistantResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "recommendedPlaces",
    "routePlan",
    "explanation",
    "warnings",
    "estimatedTime",
    "transportTips",
  ],
  properties: {
    recommendedPlaces: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "category", "reason"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          category: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    routePlan: {
      type: "object",
      additionalProperties: false,
      required: ["title", "days", "difficulty", "stops", "steps"],
      properties: {
        title: { type: "string" },
        days: { type: "number" },
        difficulty: { type: "string" },
        stops: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "name", "coordinates", "note"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              coordinates: {
                type: "array",
                minItems: 2,
                maxItems: 2,
                items: { type: "number" },
              },
              note: { type: "string" },
            },
          },
        },
        steps: {
          type: "array",
          maxItems: 8,
          items: { type: "string" },
        },
      },
    },
    explanation: { type: "string" },
    warnings: {
      type: "array",
      maxItems: 6,
      items: { type: "string" },
    },
    estimatedTime: { type: "string" },
    transportTips: {
      type: "array",
      maxItems: 6,
      items: { type: "string" },
    },
  },
};
