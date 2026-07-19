"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
    headingRef.current?.focus();
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070707] px-4 py-20 text-white sm:px-6"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,rgba(7,7,7,0.2),#070707)]" />
      <section className="glass-card relative z-10 w-full max-w-2xl p-6 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
          MangystauTrails
        </p>
        <h1
          ref={headingRef}
          id="error-title"
          tabIndex={-1}
          className="mt-5 text-3xl font-semibold text-white outline-none sm:text-4xl"
        >
          The trail was interrupted
        </h1>
        <p
          id="error-description"
          className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base"
        >
          We could not finish loading this part of your journey. Try the route again, or return
          to the main travel hub.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs text-white/50">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="btn btn-active inline-flex min-h-11 items-center justify-center px-6"
          >
            Try again
          </button>
          <Link href="/" className="btn inline-flex min-h-11 items-center justify-center px-6 text-center">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
