"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
    headingRef.current?.focus();
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#070707] text-white">
        <title>MangystauTrails | Unexpected error</title>
        <main
          className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20 sm:px-6"
          aria-labelledby="global-error-title"
          aria-describedby="global-error-description"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,rgba(7,7,7,0.2),#070707)]" />
          <section className="glass-card relative z-10 w-full max-w-2xl p-6 text-center sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
              MangystauTrails
            </p>
            <h1
              ref={headingRef}
              id="global-error-title"
              tabIndex={-1}
              className="mt-5 text-3xl font-semibold text-white outline-none sm:text-4xl"
            >
              We lost the trail for a moment
            </h1>
            <p
              id="global-error-description"
              className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base"
            >
              A temporary problem stopped MangystauTrails from opening. Retry the experience or
              start again from the home page.
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
      </body>
    </html>
  );
}
