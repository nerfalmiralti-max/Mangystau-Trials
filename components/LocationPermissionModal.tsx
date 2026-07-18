"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.getAttribute("aria-hidden") !== "true" && element.getClientRects().length > 0
  );
}

function isTopmostDialog(dialog: HTMLElement) {
  const openDialogs = Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')
  ).filter((element) => element.getClientRects().length > 0);

  return openDialogs.at(-1) === dialog;
}

function trapTabKey(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== "Tab") return;

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
  if (event.shiftKey && currentIndex <= 0) {
    event.preventDefault();
    focusableElements.at(-1)?.focus();
  } else if (!event.shiftKey && (currentIndex === -1 || currentIndex === focusableElements.length - 1)) {
    event.preventDefault();
    focusableElements[0].focus();
  }
}

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const onMaybeLaterRef = useRef(onMaybeLater);

  useEffect(() => {
    onMaybeLaterRef.current = onMaybeLater;
  }, [onMaybeLater]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || !isTopmostDialog(dialog)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onMaybeLaterRef.current();
        return;
      }

      trapTabKey(event, dialog);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => onMaybeLaterRef.current()}
        disabled={isLoading}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm disabled:cursor-wait"
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-permission-title"
        aria-describedby="location-permission-description"
        tabIndex={-1}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="glass-card relative w-full max-w-md p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)] md:p-6"
      >
        <button
          type="button"
          aria-label="Close location permission"
          onClick={() => onMaybeLaterRef.current()}
          disabled={isLoading}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-lg text-white/80 transition hover:bg-white/14 disabled:opacity-60"
        >
          x
        </button>
        <p className="text-sm uppercase tracking-[0.24em] text-white/40">Location access</p>
        <h2
          ref={headingRef}
          id="location-permission-title"
          tabIndex={-1}
          className="mt-3 text-2xl font-semibold text-white outline-none"
        >
          Enable Location
        </h2>
        <p id="location-permission-description" className="mt-4 text-sm leading-7 text-white/68">
          Allow location to find nearby hotels, attractions and routes.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onAllow}
            disabled={isLoading}
            className="btn chat-button inline-flex min-h-11 w-full items-center justify-center disabled:opacity-60"
          >
            {isLoading ? "Locating..." : "Allow"}
          </button>
          <button
            type="button"
            onClick={() => onMaybeLaterRef.current()}
            disabled={isLoading}
            className="btn inline-flex min-h-11 w-full items-center justify-center bg-white/5 text-white/80 disabled:opacity-60"
          >
            Later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
