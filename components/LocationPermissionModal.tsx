"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMaybeLater();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onMaybeLater]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-permission-title"
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8"
    >
      <button
        type="button"
        aria-label="Close location permission"
        onClick={onMaybeLater}
        disabled={isLoading}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm disabled:cursor-wait"
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="glass-card relative w-full max-w-md p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)] md:p-6"
      >
        <button
          type="button"
          aria-label="Close location permission"
          onClick={onMaybeLater}
          disabled={isLoading}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/8 text-lg text-white/80 transition hover:bg-white/14 disabled:opacity-60"
        >
          x
        </button>
        <p className="text-sm uppercase tracking-[0.24em] text-white/40">Location access</p>
        <h2 id="location-permission-title" className="mt-3 text-2xl font-semibold text-white">
          Enable Location
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/68">
          Allow location to find nearby hotels, attractions and routes.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onAllow}
            disabled={isLoading}
            className="btn chat-button w-full justify-center disabled:opacity-60"
          >
            {isLoading ? "Locating..." : "Allow"}
          </button>
          <button
            type="button"
            onClick={onMaybeLater}
            disabled={isLoading}
            className="btn w-full justify-center bg-white/5 text-white/80 disabled:opacity-60"
          >
            Later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
