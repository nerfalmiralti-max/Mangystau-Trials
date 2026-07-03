import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AssistantConfigurationError,
  AssistantProviderError,
  askTravelAssistant,
  type AssistantLanguage,
  type AssistantHistoryItem,
} from "@/lib/assistantService";

type AssistantApiRequest = {
  message?: string;
  selectedPlaceId?: string;
  history?: AssistantHistoryItem[];
  language?: AssistantLanguage;
  sessionId?: string;
};

type LimitState = {
  count: number;
  resetAt: number;
};

export const runtime = "nodejs";

const requestLimits = new Map<string, LimitState>();
const windowMs = 60 * 60 * 1000;
const maxRequests = 20;

function readText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\0/g, "").trim().slice(0, maxLength);
}

function getClientId(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
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
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: maxRequests - current.count, resetAt: current.resetAt };
}

function createSessionId() {
  return `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
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
  language: AssistantLanguage;
  provider: "openai" | "error";
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
    console.error("Assistant history save failed", error);
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AssistantApiRequest;
  const language = body.language === "en" ? "en" : "ru";
  const message = readText(body.message, 1600);
  const selectedPlaceId = readText(body.selectedPlaceId, 120) || undefined;
  const sessionId = readText(body.sessionId, 120) || createSessionId();
  const clientId = getClientId(request);

  if (!message) {
    return NextResponse.json(
      { error: "Message is required.", code: "EMPTY_MESSAGE" },
      { status: 400 }
    );
  }

  const limit = checkLimit(clientId);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Hourly AI limit reached. Please try again later.",
        code: "RATE_LIMITED",
        remaining: 0,
        resetAt: limit.resetAt,
      },
      { status: 429 }
    );
  }

  await saveChatHistory({
    sessionId,
    clientId,
    role: "traveler",
    text: message,
    selectedPlaceId,
    language,
    provider: "openai",
  });

  try {
    const { answer, model } = await askTravelAssistant({
      message,
      selectedPlaceId,
      history: Array.isArray(body.history) ? body.history : [],
      language,
    });

    await saveChatHistory({
      sessionId,
      clientId,
      role: "assistant",
      text: answer.explanation,
      selectedPlaceId,
      language,
      provider: "openai",
      model,
    });

    return NextResponse.json({
      answer,
      text: answer.explanation,
      sessionId,
      remaining: limit.remaining,
      mode: "openai",
      model,
    });
  } catch (error) {
    const status = error instanceof AssistantConfigurationError ? 503 : 502;
    const messageText =
      error instanceof AssistantConfigurationError || error instanceof AssistantProviderError
        ? error.message
        : "AI assistant is unavailable right now. Please try again.";

    await saveChatHistory({
      sessionId,
      clientId,
      role: "assistant",
      text: messageText,
      selectedPlaceId,
      language,
      provider: "error",
    });

    return NextResponse.json(
      {
        error: messageText,
        code: error instanceof AssistantConfigurationError ? "AI_NOT_CONFIGURED" : "AI_UNAVAILABLE",
        sessionId,
        remaining: limit.remaining,
      },
      { status }
    );
  }
}
