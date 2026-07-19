import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070707] px-4 py-20 text-white sm:px-6"
      aria-labelledby="not-found-title"
      aria-describedby="not-found-description"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,rgba(7,7,7,0.2),#070707)]" />
      <section className="glass-card relative z-10 w-full max-w-2xl p-6 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
          MangystauTrails / 404
        </p>
        <h1 id="not-found-title" className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
          This trail does not exist
        </h1>
        <p
          id="not-found-description"
          className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base"
        >
          The destination may have moved, or the address may be incomplete. Return to the travel
          hub or continue with the destination catalog.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="btn btn-active inline-flex min-h-11 items-center justify-center px-6 text-center"
          >
            Return home
          </Link>
          <Link
            href="/locations"
            className="btn inline-flex min-h-11 items-center justify-center px-6 text-center"
          >
            Browse destinations
          </Link>
        </div>
      </section>
    </main>
  );
}
