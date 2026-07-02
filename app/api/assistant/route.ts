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

const requestLimits = new Map<string, LimitState>();
const windowMs = 60 * 60 * 1000;
const maxRequests = 20;
const defaultModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2:3b";
const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://127.0.0.1:11434";
const aiProvider = process.env.AI_PROVIDER || (process.env.OPENAI_API_KEY ? "openai" : "offline");

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

function buildFallbackReply(message: string, selectedPlaceId?: string) {
  const route = selectedPlaceId ? buildRouteToPlace(selectedPlaceId) : null;
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
  const response = await fetch(`${ollamaApiUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
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
      max_output_tokens: 220,
    }),
  });

  if (!response.ok) {
    return "";
  }

  return getOutputText(await response.json());
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AssistantRequest;
  const message = body.message?.trim() || "Build a tourist route in Kazakhstan";
  const clientId = getClientId(req);
  const limit = checkLimit(clientId);

  if (!limit.allowed) {
    return NextResponse.json({
      text: buildFallbackReply(message, body.selectedPlaceId),
      limited: true,
      remaining: 0,
      resetAt: requestLimits.get(clientId)?.resetAt,
      mode: "offline",
      model: null,
    });
  }

  const selectedPlace = PLACES.find((place) => place.id === body.selectedPlaceId);
  const history = (body.history ?? [])
    .slice(-6)
    .map((item) => `${item.role === "traveler" ? "Traveler" : "MangystauTrails AI"}: ${item.text ?? ""}`)
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
    const language = body.language === "en" ? ("en" as const) : ("ru" as const);
    const providerArgs = {
      message,
      history,
      selectedPlace,
      attractionContext,
      language,
    };

    const openaiText = aiProvider === "openai" ? await askOpenAI(providerArgs) : "";
    const ollamaText = aiProvider === "ollama" ? await askOllama(providerArgs) : "";
    const text = openaiText || ollamaText || buildFallbackReply(message, body.selectedPlaceId);

    return NextResponse.json({
      text,
      limited: false,
      remaining: limit.remaining,
      mode: openaiText ? "openai" : ollamaText ? "ollama" : "offline",
      model: openaiText ? defaultModel : ollamaText ? ollamaModel : null,
    });
  } catch {
    return NextResponse.json({
      text: buildFallbackReply(message, body.selectedPlaceId),
      limited: false,
      remaining: limit.remaining,
      mode: "offline",
      model: null,
    });
  }
}
