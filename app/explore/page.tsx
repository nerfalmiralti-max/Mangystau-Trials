"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Place = {
  id: string;
  name: string;
  description?: string;
};

export default function ExplorePage() {
  const router = useRouter();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVisit, setLoadingVisit] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/places");
        const data = await res.json();
        setPlaces(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const visitPlace = async (placeId: string) => {
    try {
      setLoadingVisit(placeId);

      await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          touristId: "demo-user",
          placeId,
        }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVisit(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-10"
      >
        <h1 className="text-4xl font-bold">Explore Mangystau 🌍</h1>
        <p className="text-white/50 mt-2">
          Discover real destinations across Kazakhstan
        </p>
      </motion.div>

      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 mt-6"
      >
        {loading ? (
          <p className="text-white/50">Loading places...</p>
        ) : (
          places.map((place, i) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 rounded-2xl border border-white/10 hover:scale-[1.03] transition"
            >
              <h2 className="text-xl font-semibold">{place.name}</h2>

              <p className="text-white/60 text-sm mt-2">
                {place.description || "No description available"}
              </p>

              <button
                onClick={() => visitPlace(place.id)}
                disabled={loadingVisit === place.id}
                className="mt-4 w-full bg-white text-black font-semibold py-2 rounded-xl hover:opacity-80 transition"
              >
                {loadingVisit === place.id ? "Saving..." : "Visit"}
              </button>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* BACK */}
      <div className="px-6 pb-10">
        <button
          onClick={() => router.push("/")}
          className="text-white/40 hover:text-white transition"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}