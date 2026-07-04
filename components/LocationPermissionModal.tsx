"use client";

import { motion } from "framer-motion";

type LocationPermissionModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  onAllow: () => void;
  onMaybeLater: () => void;
};

export default function LocationPermissionModal({
  isOpen,
  isLoading,
  onAllow,
  onMaybeLater,
}: LocationPermissionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-permission-title"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="glass-card w-full max-w-md p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)] md:p-6"
      >
        <p className="text-sm uppercase tracking-[0.24em] text-white/40">Location access</p>
        <h2 id="location-permission-title" className="mt-3 text-2xl font-semibold text-white">
          {"\uD83D\uDCCD Enable your location"}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/68">
          Allow access to your location so we can find the nearest hotels, attractions, transport
          and build the fastest route just for you.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onAllow}
            disabled={isLoading}
            className="btn chat-button w-full justify-center disabled:opacity-60"
          >
            {isLoading ? "Locating..." : "Allow location"}
          </button>
          <button
            type="button"
            onClick={onMaybeLater}
            disabled={isLoading}
            className="btn w-full justify-center bg-white/5 text-white/80 disabled:opacity-60"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
