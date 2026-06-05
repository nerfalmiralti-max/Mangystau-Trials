"use client";

import { useState } from "react";
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

export default function Home() {
  const [tab, setTab] = useState<"home" | "explore">("home");
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h1 className="text-xl font-semibold">NomadGo</h1>

        <div className="flex gap-2">
          {["home", "explore"].map((t) => (
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
            <h2 className="text-3xl font-bold">
              Welcome to NomadGo
            </h2>

            <p className="text-white/70">
              AI travel explorer for Kazakhstan.
            </p>
          </motion.div>
        )}

        {/* EXPLORE */}
        {tab === "explore" && (
          <div className="grid md:grid-cols-2 gap-4">

            {PLACES.map((p, i) => (
              <motion.div
                key={i}
                className="card cursor-pointer"
                onClick={() =>
                  setOpened(opened === p.name ? null : p.name)
                }
              >

                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="text-white/60">{p.desc}</p>

                <p className="text-white/30 text-xs mt-2">
                  Open details
                </p>

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