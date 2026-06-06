"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PLACES = [
  {
    name: "Almaty",
    desc: "Mountains and cultural capital",
    facts: [
      "Largest city in Kazakhstan",
      "Located near the Tian Shan mountains",
      "Former capital of Kazakhstan",
      "Tour guide: +7 701 123 45 67"
    ],
    bio:
      "Almaty is the cultural and economic center of Kazakhstan, known for its green streets, mountains and modern lifestyle. Guide contact: +7 701 123 45 67",
  },
  {
    name: "Astana",
    desc: "Futuristic capital city",
    facts: [
      "Capital of Kazakhstan since 1997",
      "Known for modern architecture",
      "One of the coldest capitals in the world",
      "Tour guide: +7 702 555 88 11"
    ],
    bio:
      "Astana is a planned capital city with futuristic buildings and rapid development. Guide contact: +7 702 555 88 11",
  },
  {
    name: "Charyn Canyon",
    desc: "Grand canyon of Central Asia",
    facts: [
      "Around 154 km long",
      "Formed over millions of years",
      "Part of Charyn National Park",
      "Tour guide: +7 707 222 90 10"
    ],
    bio:
      "Charyn Canyon is one of the most dramatic natural landscapes in Kazakhstan. Guide contact: +7 707 222 90 10",
  },
  {
    name: "Kaindy Lake",
    desc: "Sunken forest lake",
    facts: [
      "Formed after 1911 earthquake",
      "Contains submerged pine forest",
      "Located in the mountains near Almaty",
      "Tour guide: +7 705 888 44 22"
    ],
    bio:
      "Kaindy Lake is famous for its underwater forest. Guide contact: +7 705 888 44 22",
  },
  {
    name: "Bozzhyra",
    desc: "Alien desert landscape",
    facts: [
      "Located in Mangystau region",
      "White chalk cliffs",
      "One of the most surreal landscapes in Kazakhstan",
      "Tour guide: +7 700 333 11 99"
    ],
    bio:
      "Bozzhyra is known for its dramatic white cliffs and alien-like scenery. Guide contact: +7 700 333 11 99",
  },
];

const CHAT_OPTIONS = [
  "Куда можно пойти в Казахстане?",
  "Что посмотреть в Алматы?",
  "Как посмотреть Астану за один день?",
  "Какие природные места стоит посетить?",
  "Мне нужен маршрут на 3 дня",
];

const BUILTIN_RESPONSES: Record<string, string> = {
  "куда можно пойти в казахстане?":
    "В NomadGo вы найдете ключевые маршруты: Алматы с горами, Астану с футуристической архитектурой, Чарынский каньон, озеро Каинды и Бозжыра. Эти места уже есть во вкладке Explore, поэтому вы можете быстро открыть каждое и узнать детали.",
  "что посмотреть в алматы?":
    "В Алматы стоит посетить зеленые парки, площадь Республики, Кок-Тобе, а также отправиться на однодневную поездку к озеру Каинды или в Чарынский каньон.",
  "как посмотреть астану за один день?":
    "Начните с Байтерека, затем прогуляйтесь по Хан-Шатыр и набережной реки Есиль. Завершите день современными объектами вроде Дворца мира и согласия.",
  "какие природные места стоит посетить?":
    "Лучшие природные локации: Чарынский каньон, озеро Каинды, Бозжыра. Каждое место показывает разную красоту Казахстана — горы, озера и пустынные скалы.",
  "мне нужен маршрут на 3 дня":
    "День 1: Алматы и Кок-Тобе. День 2: озеро Каинды и Чарынский каньон. День 3: Астана — Байтерек, Хан-Шатыр и набережная. Все эти точки можно найти во вкладке Explore.",
};

const normalizeQuery = (text: string) => text.trim().toLowerCase();

export default function Home() {
  const [tab, setTab] = useState<"home" | "explore" | "chat">("home");
  const [opened, setOpened] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { role: "bot" | "user"; text: string }[]
  >([
    {
      role: "bot",
      text: "Hello! I am the Nomadgo AI guide. I will help you find interesting places and planned live-guide journeys.",
    },
    {
      role: "bot",
      text: "If free AI access is not available, I will use built-in travel answers to keep helping you right inside the app.",
    },
    {
      role: "bot",
      text: "Try one of the options below or ask your own question.",
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (tab === "chat") {
      setOpened(null);
    }
  }, [tab]);

  const addMessage = (message: { role: "bot" | "user"; text: string }) => {
    setMessages((prev) => [...prev, message]);
  };

  const replyTo = (text: string) => {
    const prompt = normalizeQuery(text);
    const fallback =
      "Я не уверен в точном ответе, но рекомендую открыть вкладку Explore и выбрать одно из популярных направлений: Алматы, Астана, Чарынский каньон, озеро Каинды или Бозжыра.";
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
    <div className="min-h-screen bg-[#070707] text-white flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h1 className="text-xl font-semibold">NomadGo</h1>

        <div className="flex gap-2">
          {["home", "explore", "chat"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`btn ${tab === t ? "btn-active" : ""}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex-1">

        {/* HOME */}
        {tab === "home" && (
          <motion.div className="card space-y-4">
            <h2 className="text-3xl font-bold">Welcome to NomadGo</h2>
            <p className="text-white/70">AI travel explorer for Kazakhstan.</p>
          </motion.div>
        )}

        {/* EXPLORE */}
        {tab === "explore" && (
          <div className="grid md:grid-cols-2 gap-4">
            {PLACES.map((p, i) => (
              <motion.div
                key={i}
                className="card cursor-pointer"
                onClick={() => setOpened(opened === p.name ? null : p.name)}
              >
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="text-white/60">{p.desc}</p>
                <p className="text-white/30 text-xs mt-2">Open details</p>

                {opened === p.name && (
                  <motion.div className="mt-4 space-y-2">
                    <p className="text-white/70 text-sm">{p.bio}</p>
                    {p.facts.map((f, idx) => (
                      <p key={idx} className="text-white/60 text-sm">
                        • {f}
                      </p>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* CHAT */}
        {tab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card space-y-6"
          >
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-4 max-w-[90%] ${
                    message.role === "bot"
                      ? "bg-white/10 border border-white/10"
                      : "ml-auto bg-white/10 border border-white/15"
                  }`}
                >
                  <p className={message.role === "bot" ? "text-white/90" : "text-white"}>
                    {message.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {CHAT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOption(option)}
                  className="btn text-sm text-white/90"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSend();
                }}
                placeholder="Напишите вопрос здесь..."
                className="flex-1 rounded-2xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-white/30"
              />
              <button onClick={handleSend} className="btn">
                Send
              </button>
            </div>

            <p className="text-xs text-white/50">
              Бесплатный режим: встроенные ответы активны, если внешняя AI-служба недоступна.
            </p>
          </motion.div>
        )}
      </div>

      {/* 🌟 FOOTER (ADDED, MOVED TO BOTTOM OF PAGE) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center text-white/40 text-xs py-6 tracking-widest font-semibold"
      >
        Made by 2Starks
      </motion.div>
    </div>
  );
}
