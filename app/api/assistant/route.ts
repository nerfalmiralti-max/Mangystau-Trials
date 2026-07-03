import { NextResponse } from "next/server";
import { PLACES, buildAssistantReply, buildRouteToPlace } from "@/lib/siteData";

type ClientMessage = {
  role?: "assistant" | "traveler";
  text?: string;
};

type AssistantRequest = {
  message?: string;
  selectedPlaceId?: string;
  history?: ClientMessage[];
  language?: "ru" | "en";
};

type LimitState = {
  count: number;
  resetAt: number;
};

type AIProvider = "openai" | "ollama" | "offline";

export const runtime = "nodejs";

const requestLimits = new Map<string, LimitState>();
const windowMs = 60 * 60 * 1000;
const maxRequests = 20;
const defaultModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b";
const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";
const configuredTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 15000);
const requestTimeoutMs = Number.isFinite(configuredTimeoutMs)
  ? Math.max(4000, configuredTimeoutMs)
  : 15000;

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

function getAIProvider(): AIProvider {
  const requestedProvider = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (requestedProvider === "openai") {
    return process.env.OPENAI_API_KEY ? "openai" : "offline";
  }

  if (requestedProvider === "ollama") {
    return "ollama";
  }

  if (requestedProvider === "offline") {
    return "offline";
  }

  return process.env.OPENAI_API_KEY ? "openai" : "offline";
}

function getClientId(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local-user"
  );
}

function checkLimit(clientId: string) {
  const now = Date.now();
  const current = requestLimits.get(clientId);

  if (!current || current.resetAt <= now) {
    requestLimits.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  return { allowed: true, remaining: maxRequests - current.count };
}

function buildFallbackReply(
  message: string,
  selectedPlaceId?: string,
  language: "ru" | "en" = "ru"
) {
  const route = selectedPlaceId ? buildRouteToPlace(selectedPlaceId) : null;

  if (language === "ru") {
    const place = route?.destination ?? PLACES.find((item) => item.id === selectedPlaceId);
    const placeText = place
      ? [
          `Фокус: ${place.name}, ${place.region}.`,
          `Лучшее время: ${place.bestTime}.`,
          `Длительность: ${place.duration}.`,
          `Совет: ${place.facts[0] ?? "Планируйте маршрут заранее и проверяйте дорогу."}`,
        ].join("\n")
      : "Фокус: выберите город прибытия, сезон, темп и тип маршрута.";
    const routeText = route
      ? `\n\nМаршрутная подсказка:\n${route.steps.join("\n")}`
      : "";

    return [
      "Сейчас отвечаю в offline-режиме, но могу помочь с маршрутом, сезоном, транспортом и безопасностью.",
      placeText,
      routeText,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const routeText = route
    ? `\n\nSuggested road to ${route.destination.name}:\n${route.steps.join("\n")}`
    : "";

  return `${buildAssistantReply(message)}${routeText}`;
}

function getOutputText(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "output_text" in data &&
    typeof data.output_text === "string" &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "output" in data &&
    Array.isArray(data.output)
  ) {
    return data.output
      .flatMap((item) =>
        typeof item === "object" &&
        item !== null &&
        "content" in item &&
        Array.isArray(item.content)
          ? item.content
          : []
      )
      .map((content) =>
        typeof content === "object" &&
        content !== null &&
        "text" in content &&
        typeof content.text === "string"
          ? content.text
          : ""
      )
      .join("\n")
      .trim();
  }

  return "";
}

function buildSystemPrompt(language: "ru" | "en" = "ru") {
  const base = [
    language === "ru"
      ? "Вы — ИИ MangystauTrails, реальный туристический помощник по Казахстану в премиальном приложении для путешествий."
      : "You are MangystauTrails AI, a real tourist assistant for Kazakhstan inside a premium travel app.",
    language === "ru"
      ? "Давайте практические, честные советы по маршруту, транспорту, сезону и безопасности для реальных мест, без рекламы и без живых цен."
      : "Give practical, grounded route advice using the provided attractions, transport details, season guidance, and safety recommendations.",
    language === "ru"
      ? "Всегда продвигайте устойчивый туризм, правило Leave No Trace и уважение к местам."
      : "Always promote sustainable tourism, Leave No Trace principles, and respect for local communities and landscapes.",
    language === "ru"
      ? "Выделяйте, когда информация может быть неточной, и предлагайте проверить детали с местным гидом."
      : "Be honest when information is uncertain and suggest checking details with a local guide.",
    language === "ru"
      ? "Говорите дружелюбно, профессионально и безопасно."
      : "Answer in a friendly, professional, and safety-conscious manner.",
  ];

  return base.join(" ");
}

async function askOllama({
  message,
  history,
  selectedPlace,
  attractionContext,
  language,
}: {
  message: string;
  history: string;
  selectedPlace?: (typeof PLACES)[number];
  attractionContext: string;
  language: "ru" | "en";
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(`${ollamaApiUrl.replace(/\/$/, "")}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(language),
          },
          {
            role: "user",
            content: [
              history ? `Recent chat:\n${history}` : "",
              language === "ru"
                ? `Запрос путешественника: ${message}`
                : `Traveler request: ${message}`,
              selectedPlace
                ? language === "ru"
                  ? `Выбранная достопримечательность: ${selectedPlace.name}, ${selectedPlace.region}.`
                  : `Selected attraction: ${selectedPlace.name}, ${selectedPlace.region}.`
                : "",
              language === "ru"
                ? `Доступные направления MangystauTrails:\n${attractionContext}`
                : `Available MangystauTrails attractions:\n${attractionContext}`,
            ]
              .filter(Boolean)
              .join("\n"),
          },
        ],
        options: {
          temperature: 0.55,
          num_predict: 220,
        },
      }),
    });

    if (!response.ok) {
      return "";
    }

    const data = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "object" &&
      data.message !== null &&
      "content" in data.message &&
      typeof data.message.content === "string"
    ) {
      return data.message.content.trim();
    }
  } finally {
    clearTimeout(timeout);
  }

  return "";
}

async function askOpenAI({
  message,
  history,
  selectedPlace,
  attractionContext,
  language,
}: {
  message: string;
  history: string;
  selectedPlace?: (typeof PLACES)[number];
  attractionContext: string;
  language: "ru" | "en";
}) {
  if (!process.env.OPENAI_API_KEY) {
    return "";
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
        instructions: buildSystemPrompt(language),
        input: [
          history ? `Recent chat:\n${history}` : "",
          language === "ru"
            ? `Запрос путешественника: ${message}`
            : `Traveler request: ${message}`,
          selectedPlace
            ? language === "ru"
              ? `Выбранная достопримечательность: ${selectedPlace.name}, ${selectedPlace.region}.`
              : `Selected attraction: ${selectedPlace.name}, ${selectedPlace.region}.`
            : "",
          language === "ru"
            ? `Доступные направления MangystauTrails:\n${attractionContext}`
            : `Available MangystauTrails attractions:\n${attractionContext}`,
        ]
          .filter(Boolean)
          .join("\n"),
        max_output_tokens: 260,
      }),
    });

    if (!response.ok) {
      return "";
    }

    return getOutputText(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AssistantRequest;
  const language = body.language === "en" ? ("en" as const) : ("ru" as const);
  const message =
    readText(body.message, 1200) ||
    (language === "ru"
      ? "Построй туристический маршрут по Казахстану"
      : "Build a tourist route in Kazakhstan");
  const clientId = getClientId(req);
  const limit = checkLimit(clientId);

  if (!limit.allowed) {
    return NextResponse.json({
      text: buildFallbackReply(message, body.selectedPlaceId, language),
      limited: true,
      remaining: 0,
      resetAt: requestLimits.get(clientId)?.resetAt,
      mode: "offline",
      model: null,
    });
  }

  const selectedPlace = PLACES.find((place) => place.id === body.selectedPlaceId);
  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-6)
    .map((item) => {
      const role = item.role === "traveler" ? "Traveler" : "MangystauTrails AI";
      return `${role}: ${readText(item.text, 700)}`;
    })
    .filter((item) => item.trim().length > 0)
    .join("\n");
  const attractionContext = PLACES.map((place) =>
    [
      `${place.name} (${place.region})`,
      `category: ${place.category}`,
      `best time: ${place.bestTime}`,
      `duration: ${place.duration}`,
      `notes: ${place.facts.join("; ")}`,
    ].join(" | ")
  ).join("\n");

  try {
    const aiProvider = getAIProvider();
    const providerArgs = {
      message,
      history,
      selectedPlace,
      attractionContext,
      language,
    };

    const openaiText = aiProvider === "openai" ? await askOpenAI(providerArgs) : "";
    const ollamaText = aiProvider === "ollama" ? await askOllama(providerArgs) : "";
    const text =
      openaiText ||
      ollamaText ||
      buildFallbackReply(message, body.selectedPlaceId, language);

    return NextResponse.json({
      text,
      limited: false,
      remaining: limit.remaining,
      mode: openaiText ? "openai" : ollamaText ? "ollama" : "offline",
      model: openaiText ? defaultModel : ollamaText ? ollamaModel : null,
    });
  } catch {
    return NextResponse.json({
      text: buildFallbackReply(message, body.selectedPlaceId, language),
      limited: false,
      remaining: limit.remaining,
      mode: "offline",
      model: null,
    });
  }
}
