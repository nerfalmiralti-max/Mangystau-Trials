import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLACES, buildAssistantReply, buildRouteToPlace } from "@/lib/siteData";

type ClientMessage = {
  role?: "assistant" | "traveler";
  text?: string;
};

type ChatRequest = {
  message?: string;
  selectedPlaceId?: string;
  history?: ClientMessage[];
  language?: "ru" | "en";
  sessionId?: string;
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
      ? "Вы — ИИ MangystauTrails, туристический помощник по Мангистау и Казахстану внутри travel-tech приложения."
      : "You are MangystauTrails AI, a tourist assistant for Mangystau and Kazakhstan inside a travel-tech app.",
    language === "ru"
      ? "Отвечайте практично: маршруты, сезон, транспорт, безопасность, подготовка, интересные факты и рекомендации по местам."
      : "Answer practically about routes, seasons, transport, safety, preparation, interesting facts, and destination recommendations.",
    language === "ru"
      ? "Не выдумывайте живые цены и расписания. Если информация может измениться, советуйте проверить детали у местного гида или официального источника."
      : "Do not invent live prices or schedules. If details may change, advise checking with a local guide or official source.",
    language === "ru"
      ? "Всегда поддерживайте устойчивый туризм, уважение к местным сообществам и принцип Leave No Trace."
      : "Always promote sustainable tourism, respect for local communities, and Leave No Trace principles.",
  ];

  return base.join(" ");
}

function buildUserPrompt({
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
  return [
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
    .join("\n");
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
            content: buildUserPrompt({
              message,
              history,
              selectedPlace,
              attractionContext,
              language,
            }),
          },
        ],
        options: {
          temperature: 0.55,
          num_predict: 260,
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
        input: buildUserPrompt({
          message,
          history,
          selectedPlace,
          attractionContext,
          language,
        }),
        max_output_tokens: 320,
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

async function saveChatHistory({
  sessionId,
  clientId,
  role,
  text,
  selectedPlaceId,
  language,
  provider,
  model,
}: {
  sessionId: string;
  clientId: string;
  role: "traveler" | "assistant";
  text: string;
  selectedPlaceId?: string;
  language: "ru" | "en";
  provider: AIProvider;
  model?: string | null;
}) {
  try {
    await prisma.chatHistory.create({
      data: {
        sessionId,
        clientId,
        role,
        text,
        selectedPlaceId: selectedPlaceId || null,
        language,
        provider,
        model: model || null,
      },
    });
  } catch (error) {
    console.error("Chat history save failed", error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = readText(url.searchParams.get("sessionId"), 120);

  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const messages = await prisma.chatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 40,
      select: {
        id: true,
        role: true,
        text: true,
        provider: true,
        model: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ChatRequest;
  const language = body.language === "en" ? ("en" as const) : ("ru" as const);
  const message =
    readText(body.message, 1200) ||
    (language === "ru"
      ? "Построй туристический маршрут по Казахстану"
      : "Build a tourist route in Kazakhstan");
  const selectedPlaceId = PLACES.some((place) => place.id === body.selectedPlaceId)
    ? body.selectedPlaceId
    : undefined;
  const sessionId =
    readText(body.sessionId, 120) ||
    `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const clientId = getClientId(req);
  const limit = checkLimit(clientId);

  await saveChatHistory({
    sessionId,
    clientId,
    role: "traveler",
    text: message,
    selectedPlaceId,
    language,
    provider: "offline",
  });

  if (!limit.allowed) {
    const limitedText = buildFallbackReply(message, selectedPlaceId, language);

    await saveChatHistory({
      sessionId,
      clientId,
      role: "assistant",
      text: limitedText,
      selectedPlaceId,
      language,
      provider: "offline",
    });

    return NextResponse.json({
      text: limitedText,
      sessionId,
      limited: true,
      remaining: 0,
      resetAt: requestLimits.get(clientId)?.resetAt,
      mode: "offline",
      model: null,
    });
  }

  const selectedPlace = PLACES.find((place) => place.id === selectedPlaceId);
  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-8)
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
    const provider: AIProvider = openaiText ? "openai" : ollamaText ? "ollama" : "offline";
    const model = openaiText ? defaultModel : ollamaText ? ollamaModel : null;
    const text =
      openaiText ||
      ollamaText ||
      buildFallbackReply(message, selectedPlaceId, language);

    await saveChatHistory({
      sessionId,
      clientId,
      role: "assistant",
      text,
      selectedPlaceId,
      language,
      provider,
      model,
    });

    return NextResponse.json({
      text,
      sessionId,
      limited: false,
      remaining: limit.remaining,
      mode: provider,
      model,
    });
  } catch {
    const text = buildFallbackReply(message, selectedPlaceId, language);

    await saveChatHistory({
      sessionId,
      clientId,
      role: "assistant",
      text,
      selectedPlaceId,
      language,
      provider: "offline",
    });

    return NextResponse.json({
      text,
      sessionId,
      limited: false,
      remaining: limit.remaining,
      mode: "offline",
      model: null,
    });
  }
}
