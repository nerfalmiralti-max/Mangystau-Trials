"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import { CHAT_OPTIONS, PLACES } from "@/lib/siteData";

type AssistantMessage = {
  role: "assistant" | "traveler";
  text: string;
};

type AssistantMode = "ollama" | "openai" | "offline";

type Language = "ru" | "en";

type AssistantApiResponse = {
  text?: string;
  error?: string;
  limited?: boolean;
  remaining?: number;
  mode?: AssistantMode;
  model?: string | null;
};

const defaultPlaceId = PLACES[2]?.id ?? PLACES[0].id;

const initialMessages: AssistantMessage[] = [
  {
    role: "assistant",
    text:
      "Привет, я ИИ MangystauTrails. Расскажи о датах, маршруте или уровне подготовки, и я помогу собрать безопасный план путешествия по Казахстану.",
  },
];

function normalizeMode(mode: unknown): AssistantMode {
  return mode === "openai" || mode === "ollama" ? mode : "offline";
}

function getModeLabel(mode: AssistantMode | null, model: string | null) {
  if (mode === "openai") return model ? `OpenAI / ${model}` : "OpenAI AI";
  if (mode === "ollama") return model ? `Ollama / ${model}` : "Local Ollama AI";
  if (mode === "offline") return "Offline travel guidance";
  return "Ready";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(defaultPlaceId);
  const [language, setLanguage] = useState<Language>("ru");
  const [isThinking, setIsThinking] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [mode, setMode] = useState<AssistantMode | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const placeFromQuery = new URLSearchParams(window.location.search).get("place");

    if (placeFromQuery && PLACES.some((place) => place.id === placeFromQuery)) {
      window.requestAnimationFrame(() => setSelectedPlaceId(placeFromQuery));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  const sendPrompt = async (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isThinking) return;

    const travelerMessage: AssistantMessage = {
      role: "traveler",
      text: cleanPrompt,
    };
    const outgoingMessages = [...messages, travelerMessage];

    setMessages((prev) => [...prev, travelerMessage]);
    setInput("");
    setError("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          selectedPlaceId,
          history: outgoingMessages.slice(-8),
          language,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as AssistantApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "MangystauTrails AI is not available right now.");
      }

      const answerText = data.text?.trim();

      if (!answerText) {
        throw new Error("The assistant returned an empty answer.");
      }

      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      setMode(normalizeMode(data.mode));
      setModel(typeof data.model === "string" ? data.model : null);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: answerText,
        },
      ]);

      if (data.limited) {
        setError("Hourly AI limit reached. Offline route guidance is still answering.");
      }
    } catch (sendError) {
      const message =
        sendError instanceof Error
          ? sendError.message
          : "MangystauTrails AI is not available right now.";

      setError(message);
      setMode("offline");
      setModel(null);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "I cannot reach the AI service right now. Try again in a moment, or ask for a route, season, safety, transport or destination recommendation and the offline guide will keep helping.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendPrompt(input);
  };

  const selectedPlace = PLACES.find((place) => place.id === selectedPlaceId) ?? PLACES[0];

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
            <AnimatedTitle text="Tourist Assistant" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base md:leading-8">
              Ask MangystauTrails AI for route ideas, logistics, destination choices and practical
              first-time travel advice. If the API key is not configured, the built-in offline guide
              keeps the chat useful.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card p-4 md:p-5">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className={`btn ${mode === "offline" ? "bg-white/5 text-white/80" : "btn-active"}`}>
                  {getModeLabel(mode, model)}
                </span>
                <span className="btn bg-white/5 text-white/80">
                  {remaining !== null ? `${remaining} asks left` : "20 asks per hour"}
                </span>
              </div>

              {error ? (
                <p
                  aria-live="polite"
                  className="mb-5 rounded-2xl border border-[#f59e0b]/45 bg-[#f59e0b]/12 p-4 text-sm leading-6 text-white"
                >
                  {error}
                </p>
              ) : null}

              <div className="max-h-[62svh] min-h-[340px] space-y-4 overflow-y-auto pr-1 md:max-h-[620px] md:min-h-[440px]">
                {messages.map((message, index) => (
                  <ChatBubble key={`${message.role}-${index}`} message={message} language={language} />
                ))}

                {isThinking ? <ThinkingBubble /> : null}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible">
                {CHAT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => void sendPrompt(option)}
                    disabled={isThinking}
                    className="btn chat-button min-w-[220px] text-left text-sm text-white/90 disabled:opacity-50 md:min-w-0"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_auto] md:items-end md:rounded-3xl">
                <label className="block space-y-2">
                  <span className="text-sm text-white/60">Selected attraction</span>
                  <select
                    value={selectedPlaceId}
                    onChange={(event) => setSelectedPlaceId(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                  >
                    {PLACES.map((place) => (
                      <option key={place.id} value={place.id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-white/60">Language</span>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as Language)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </label>

                <div className="space-y-2 text-sm text-white/55 md:col-span-2 md:text-right">
                  <div>{getModeLabel(mode, model)}</div>
                  <div>Current focus: {selectedPlace.name}</div>
                </div>
              </div>

              <form onSubmit={submitPrompt} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={input}
                  rows={1}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendPrompt(input);
                    }
                  }}
                  placeholder="Ask about route, budget, season or destination..."
                  className="min-h-12 flex-1 resize-y rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-white/30 md:py-4"
                />
                <button
                  type="submit"
                  disabled={isThinking || !input.trim()}
                  className="btn chat-button w-full disabled:opacity-50 sm:w-auto"
                >
                  {isThinking ? "Thinking..." : "Ask AI"}
                </button>
              </form>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Travel intelligence</p>
                <h3 className="mt-3 text-2xl font-semibold">Assistant focus</h3>
                <div className="mt-5 grid gap-3">
                  {["Mangystau routes", "Season choice", "Transport notes", "Safety basics"].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Known places</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {PLACES.map((place) => (
                    <span key={place.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                      {place.name}
                    </span>
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

function ChatBubble({
  message,
  language,
}: {
  message: AssistantMessage;
  language: Language;
}) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={`max-w-[94%] rounded-2xl border p-4 shadow-[0_16px_36px_rgba(0,0,0,0.14)] md:rounded-3xl ${
        isAssistant
          ? "border-white/10 bg-white/8"
          : "ml-auto border-white/20 bg-white text-black"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.2em] opacity-50">
        {isAssistant ? "MangystauTrails AI" : language === "ru" ? "Путешественник" : "Traveler"}
      </p>
      <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 md:text-base">
        {message.text}
      </p>
    </motion.div>
  );
}

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[94%] rounded-2xl border border-white/10 bg-white/8 p-4 md:rounded-3xl"
      aria-live="polite"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-white/45">MangystauTrails AI</p>
      <div className="mt-3 flex items-center gap-2">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
            className="h-2 w-2 rounded-full bg-white/70"
          />
        ))}
      </div>
    </motion.div>
  );
}
