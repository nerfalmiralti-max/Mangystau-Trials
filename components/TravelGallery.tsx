"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
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

type TravelGalleryProps = {
  images: string[];
  title: string;
  priorityFirst?: boolean;
};

export default function TravelGallery({
  images,
  title,
  priorityFirst = false,
}: TravelGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const accessibleTitle = title.trim() || "Travel";
  const isGalleryOpen = Boolean(activeImage);

  useEffect(() => {
    if (!isGalleryOpen) {
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
        setActiveIndex(null);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % images.length
        );
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + images.length) % images.length
        );
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
  }, [images.length, isGalleryOpen]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="relative aspect-[4/3] w-44 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-white/5 text-left transition hover:border-white/24 sm:w-56"
            aria-label={`Open ${title} photo ${index + 1}`}
          >
            <Image
              src={src}
              alt={`${title} gallery ${index + 1}`}
              fill
              sizes="(max-width: 640px) 176px, 224px"
              priority={priorityFirst && index === 0}
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[110] bg-black/92 px-3 py-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 pb-3">
              <h2 id={titleId} className="min-w-0 truncate text-sm font-semibold text-white/80">
                {accessibleTitle} / {activeIndex! + 1} of {images.length}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setActiveIndex(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white"
                aria-label="Close gallery"
              >
                x
              </button>
            </div>

            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative min-h-0 flex-1 overflow-hidden rounded-[20px] border border-white/10 bg-white/5"
            >
              <Image
                src={activeImage}
                alt={`${title} fullscreen photo`}
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
            </motion.div>

            {images.length > 1 ? (
              <div className="grid shrink-0 grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === null ? current : (current - 1 + images.length) % images.length
                    )
                  }
                  className="btn inline-flex min-h-11 items-center justify-center bg-white/8 text-white/82"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === null ? current : (current + 1) % images.length
                    )
                  }
                  className="btn inline-flex min-h-11 items-center justify-center bg-white/8 text-white/82"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
