"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ApiViewer() {
  const router = useRouter();

  const [places, setPlaces] = useState<any[]>([]);
  const [tourists, setTourists] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/places").then(r => r.json()).then(setPlaces);
    fetch("/api/tourists").then(r => r.json()).then(setTourists);
    fetch("/api/visits").then(r => r.json()).then(setVisits);
  }, []);

  return (
    <div className="min-h-screen bg-[#070707] text-white p-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold">API Dashboard ⚡</h1>
        <p className="text-white/50 mt-2">
          Real-time backend data
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">

        <div className="glass-card p-5 border border-white/10 rounded-2xl">
          <h2 className="text-xl mb-3">Places 🌍</h2>
          {places.map((p) => (
            <p key={p.id} className="text-white/60 text-sm">
              • {p.name}
            </p>
          ))}
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl">
          <h2 className="text-xl mb-3">Tourists 👤</h2>
          {tourists.map((t) => (
            <p key={t.id} className="text-white/60 text-sm">
              • {t.name}
            </p>
          ))}
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl">
          <h2 className="text-xl mb-3">Visits 📊</h2>
          {visits.map((v) => (
            <p key={v.id} className="text-white/60 text-sm">
              • visit recorded
            </p>
          ))}
        </div>

      </div>

      <div className="mt-10">
        <button
          onClick={() => router.push("/")}
          className="text-white/40 hover:text-white"
        >
          ← Back to Home
        </button>
      </div>

    </div>
  );
}