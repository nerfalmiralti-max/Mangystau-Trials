"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) =>
          current === null ? current : (current + 1) % images.length
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? current : (current - 1 + images.length) % images.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, images.length]);

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
          className="fixed inset-0 z-[110] bg-black/92 px-3 py-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} fullscreen gallery`}
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 pb-3">
              <p className="min-w-0 truncate text-sm font-semibold text-white/80">
                {title} / {activeIndex! + 1} of {images.length}
              </p>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white"
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
                  className="btn bg-white/8 text-white/82"
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
                  className="btn bg-white/8 text-white/82"
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
