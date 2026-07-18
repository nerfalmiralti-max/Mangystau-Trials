"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const accessibleTitle = title?.trim() || "Travel details";

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || !isTopmostDialog(dialog)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      trapTabKey(event, dialog);
    };

    const closeFromEvent = () => onCloseRef.current();

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mangystau:close-overlays", closeFromEvent);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mangystau:close-overlays", closeFromEvent);

      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => onCloseRef.current()}
        className="absolute inset-0 h-full w-full cursor-default bg-black/68 backdrop-blur-sm"
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ y: "100%", opacity: 0.92 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.92 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[26px] border border-white/10 bg-[#080808]/96 shadow-[0_-28px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:bottom-4 md:rounded-[26px]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-3 sm:px-5">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/25" />
          <div className="flex items-center justify-between gap-3">
            <h2 id={titleId} className="min-w-0 truncate text-base font-semibold text-white sm:text-lg">
              {accessibleTitle}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => onCloseRef.current()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/8 text-lg text-white transition hover:bg-white/14"
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
