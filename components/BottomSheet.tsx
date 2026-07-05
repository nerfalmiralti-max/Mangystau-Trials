"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type BottomSheetProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export default function BottomSheet({
  isOpen,
  title,
  onClose,
  children,
  footer,
}: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mangystau:close-overlays", onClose);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mangystau:close-overlays", onClose);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/68 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%", opacity: 0.92 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.92 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[26px] border border-white/10 bg-[#080808]/96 shadow-[0_-28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:bottom-4 md:rounded-[26px]"
      >
        <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-3 sm:px-5">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/25" />
          <div className="flex items-center justify-between gap-3">
            {title ? (
              <h2 className="min-w-0 truncate text-base font-semibold text-white sm:text-lg">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-lg text-white transition hover:bg-white/14"
              aria-label="Close bottom sheet"
            >
              x
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-white/10 bg-[#080808]/94 px-4 py-3 sm:px-5">
            {footer}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
