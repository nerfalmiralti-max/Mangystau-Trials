"use client";

import { useEffect, useState } from "react";
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

const initialMessages: AssistantMessage[] = [
  {
    role: "assistant",
    text:
      "Привет, я ИИ MangystauTrails. Расскажи о своих датах, маршруте или уровне подготовки, и я подготовлю безопасный и устойчивый план путешествия по Казахстану.",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(PLACES[2].id);
  const [language, setLanguage] = useState<Language>("ru");
  const [isThinking, setIsThinking] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [mode, setMode] = useState<AssistantMode | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const placeFromQuery = url.searchParams.get("place");
    if (placeFromQuery && PLACES.some((place) => place.id === placeFromQuery)) {
      setSelectedPlaceId(placeFromQuery);
    }
  }, []);

  const sendPrompt = async (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isThinking) return;

    const outgoingMessages: AssistantMessage[] = [
      ...messages,
      { role: "traveler", text: cleanPrompt },
    ];

    setMessages((prev) => [...prev, { role: "traveler", text: cleanPrompt }]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleanPrompt,
          selectedPlaceId,
          history: outgoingMessages.slice(-6),
          language,
        }),
      });
      const data = await response.json();

      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      setMode(
        data.mode === "ollama" || data.mode === "openai" ? data.mode : "offline"
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text || "I can help you choose a route, season and transport for Kazakhstan.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "I cannot reach MangystauTrails AI right now. The map and route generator are still available while the AI connection recovers.",
        },
      ]);
      setMode("offline");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="chat" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="space-y-3">
            <AnimatedTitle text="Tourist Assistant" className="text-3xl md:text-4xl" />
            <p className="max-w-3xl leading-8 text-white/70">
              Ask the real MangystauTrails AI for route ideas, logistics, destination choices and
              first-time travel advice. Tourist access includes 20 AI asks per hour, then offline travel guidance keeps answering.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card p-5">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className={`btn ${mode === "offline" ? "bg-white/5 text-white/80" : "btn-active"}`}>
                  {mode === "offline"
                    ? "Offline backup"
                    : mode === "openai"
                      ? "OpenAI AI"
                      : "Local Ollama AI"}
                </span>
                <span className="btn bg-white/5 text-white/80">
                  {remaining !== null ? `${remaining} free asks left` : "20 free asks per hour"}
                </span>
              </div>

              <div className="min-h-[360px] space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24 }}
                    className={`max-w-[92%] rounded-3xl border p-4 ${
                      message.role === "assistant"
                        ? "border-white/10 bg-white/8"
                        : "ml-auto border-white/20 bg-white text-black"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] opacity-50">
                      {message.role === "assistant" ? "MangystauTrails AI" : "Traveler"}
                    </p>
                    <p className="mt-2 leading-7">{message.text}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {CHAT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => sendPrompt(option)}
                    className="btn chat-button text-left text-sm text-white/90"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_auto] md:items-end">
                <div className="space-y-3">
                  <label className="block space-y-2">
                    <span className="text-sm text-white/60">Selected attraction</span>
                    <select
                      value={selectedPlaceId}
                      onChange={(event) => setSelectedPlaceId(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
                    >
                      {PLACES.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="block space-y-2">
                    <span className="text-sm text-white/60">Language</span>
                    <select
                      value={language}
                      onChange={(event) => setLanguage(event.target.value as Language)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                </div>
                <div className="space-y-3 md:col-span-2 md:text-right">
                  <div className="text-sm text-white/45">
                    {mode === "ollama"
                      ? "Ollama powered"
                      : mode === "openai"
                        ? "OpenAI powered"
                        : mode === "offline"
                          ? "Local AI unavailable"
                          : "Ready"}
                    {remaining !== null ? ` / ${remaining} left this hour` : ""}
                  </div>
                  <div className="text-sm text-white/60">
                    Current focus: {PLACES.find((place) => place.id === selectedPlaceId)?.name ?? "General Kazakhstan"}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") sendPrompt(input);
                  }}
                  placeholder="Ask about route, budget, season or destination..."
                  className="flex-1 rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-4 text-white outline-none focus:border-white/30"
                />
                <button
                  onClick={() => sendPrompt(input)}
                  disabled={isThinking}
                  className="btn chat-button w-full disabled:opacity-50 sm:w-auto"
                >
                  {isThinking ? "Thinking..." : "Ask AI"}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/40">Travel intelligence</p>
                <h3 className="mt-3 text-2xl font-semibold">Assistant focus</h3>
                <div className="mt-5 grid gap-3">
                  {["Route logic", "Season choice", "Transport notes", "Safety basics"].map((item) => (
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
