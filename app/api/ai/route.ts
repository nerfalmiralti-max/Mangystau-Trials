import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  askTravelAssistant,
  getAssistantErrorLog,
  type AssistantHistoryItem,
  type AssistantLanguage,
  type AssistantRequestInput,
} from "@/lib/assistantService";

type AssistantApiRequest = {
  message?: string;
  selectedPlace?: AssistantRequestInput["selectedPlace"];
  selectedPlaceId?: string;
  history?: AssistantHistoryItem[];
  language?: AssistantLanguage;
  sessionId?: string;
  tripContext?: AssistantRequestInput["tripContext"];
};

type LimitState = {
  count: number;
  resetAt: number;
};

export const runtime = "nodejs";

const aiFallbackMessage = "AI guide is temporarily unavailable. Please try again later.";
const requestLimits = new Map<string, LimitState>();
const windowMs = 60 * 60 * 1000;
const maxRequests = 20;

function getHttpStatusFromAssistantCode(code: string) {
  if (code === "MISSING_API_KEY") return 503;
  if (code === "QUOTA_OR_RATE_LIMIT") return 429;
  if (code === "GEMINI_TIMEOUT") return 504;
  return 502;
}

function getPublicReasonFromAssistantCode(code: string) {
  if (code === "MISSING_API_KEY") return "GEMINI_API_KEY is not configured on the server.";
  if (code === "INVALID_API_KEY") return "Gemini rejected the configured API key.";
  if (code === "QUOTA_OR_RATE_LIMIT") return "Gemini quota or rate limit was reached.";
  if (code === "NETWORK_ERROR") return "The server could not reach Gemini API.";
  if (code === "GEMINI_TIMEOUT") return "Gemini API request timed out.";
  if (code === "GEMINI_BAD_RESPONSE") return "Gemini returned an invalid structured response.";
  if (code === "GEMINI_EMPTY_RESPONSE") return "Gemini returned an empty response.";
  return "Gemini SDK returned an error.";
}

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

function getSelectedPlaceId(body: AssistantApiRequest) {
  return readText(body.selectedPlaceId, 120) || readText(body.selectedPlace?.id, 120) || undefined;
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
  provider: "gemini" | "error";
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
  const message = readText(body.message, 1800);
  const selectedPlaceId = getSelectedPlaceId(body);
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
    provider: "gemini",
  });

  try {
    const { answer, model } = await askTravelAssistant({
      message,
      selectedPlaceId,
      selectedPlace: body.selectedPlace ?? null,
      tripContext: body.tripContext ?? null,
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
      provider: "gemini",
      model,
    });

    return NextResponse.json({
      answer,
      text: answer.explanation,
      sessionId,
      remaining: limit.remaining,
      mode: "gemini",
      model,
    });
  } catch (error) {
    const diagnostic = getAssistantErrorLog(error);
    const status = getHttpStatusFromAssistantCode(diagnostic.code);
    const code = diagnostic.code;

    console.error("AI assistant request failed", {
      code: diagnostic.code,
      providerStatus: diagnostic.status,
      retryable: diagnostic.retryable,
      reason: diagnostic.reason,
      model: "gemini-2.5-flash",
      sessionId,
      selectedPlaceId: selectedPlaceId ?? null,
    });

    await saveChatHistory({
      sessionId,
      clientId,
      role: "assistant",
      text: aiFallbackMessage,
      selectedPlaceId,
      language,
      provider: "error",
    });

    return NextResponse.json(
      {
        error: aiFallbackMessage,
        code,
        reason: getPublicReasonFromAssistantCode(diagnostic.code),
        sessionId,
        remaining: limit.remaining,
      },
      { status }
    );
  }
}
