"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedHero from "../../components/AnimatedHero";
import AnimatedTitle from "../../components/AnimatedTitle";
import { CHAT_OPTIONS, BUILTIN_RESPONSES, normalizeQuery } from "../../lib/siteData";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const addMessage = (message: { role: "bot" | "user"; text: string }) => {
    setMessages((prev) => [...prev, message]);
  };

  const replyTo = (text: string) => {
    const prompt = normalizeQuery(text);
    const fallback =
      "Я не уверен в точном ответе, но рекомендую открыть вкладку Explore и выбрать направление, которое лучше всего подходит вам.";
    addMessage({ role: "bot", text: BUILTIN_RESPONSES[prompt] ?? fallback });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    addMessage({ role: "user", text });
    replyTo(text);
    setInput("");
  };

  const handleOption = (option: string) => {
    addMessage({ role: "user", text: option });
    replyTo(option);
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
          <AnimatedTitle text="Chat" className="text-3xl md:text-4xl" />

          <div className="max-w-3xl space-y-4">
            <p className="text-white/70 leading-8">
              Минималистичный чат-помощник для быстрого поиска маршрутов и вечных вопросов о Казахстане.
            </p>
            <p className="text-white/60">
              Убрали громоздкий контейнер — теперь информация подается легко и красиво, как во вкладке Home.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.04 }}
                  className={`rounded-3xl p-4 max-w-[90%] ${
                    message.role === "bot"
                      ? "bg-white/10 border border-white/10"
                      : "ml-auto bg-white/10 border border-white/15"
                  }`}
                >
                  <p className={message.role === "bot" ? "text-white/90" : "text-white"}>
                    {message.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {CHAT_OPTIONS.map((option) => (
                <motion.button
                  key={option}
                  onClick={() => handleOption(option)}
                  className="btn chat-button text-sm text-white/90"
                  whileHover={{ scale: 1.02 }}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSend();
                }}
                placeholder="Напишите вопрос здесь..."
                className="flex-1 rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-4 text-white outline-none focus:border-white/30"
              />
              <motion.button
                onClick={handleSend}
                whileTap={{ scale: 0.98 }}
                className="btn chat-button w-full sm:w-auto"
              >
                Send
              </motion.button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
