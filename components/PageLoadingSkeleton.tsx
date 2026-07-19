type PageLoadingSkeletonProps = {
  activeTab?:
    | "home"
    | "routes"
    | "explore"
    | "locations"
    | "chat"
    | "settings"
    | "saved"
    | "offline"
    | "profile"
    | "help"
    | "about";
};

export default function PageLoadingSkeleton({ activeTab = "locations" }: PageLoadingSkeletonProps) {
  return (
    <div
      className="relative min-h-screen bg-[#070707] text-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    >
      <span className="sr-only">Loading MangystauTrails travel content...</span>

      <div
        className="relative isolate min-h-[82svh] overflow-hidden pb-16 md:min-h-screen md:pb-20"
        aria-hidden="true"
      >
        <div className="pointer-events-none fixed inset-x-0 z-50 px-3 md:px-5" style={{ top: "calc(env(safe-area-inset-top) + 12px)" }}>
          <div className="pointer-events-auto mx-auto flex max-w-7xl items-center gap-3 rounded-[22px] border border-white/12 bg-[#0b0b0b]/72 p-1.5 shadow-[0_18px_55px_rgba(0,0,0,0.32)] backdrop-blur-2xl md:rounded-full">
            <div className="hidden h-8 w-40 rounded-full bg-white/8 md:block" />
            <div className="grid flex-1 grid-cols-5 gap-1 md:flex md:justify-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`${activeTab}-${index}`}
                  className="h-10 rounded-[18px] bg-white/8 md:h-9 md:w-20 md:rounded-full"
                />
              ))}
            </div>
            <div className="h-10 w-10 shrink-0 rounded-[18px] bg-white/8 md:h-11 md:w-11 md:rounded-full" />
          </div>
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
          <div className="space-y-4">
            <div className="h-4 w-44 rounded-full bg-white/10" />
            <div className="h-4 w-full max-w-xl rounded-full bg-white/8" />
            <div className="mt-12 h-16 w-full max-w-3xl rounded-[20px] bg-white/8 md:h-24" />
            <div className="h-5 w-full max-w-2xl rounded-full bg-white/8" />
            <div className="h-5 w-full max-w-xl rounded-full bg-white/8" />
          </div>
        </div>
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8"
        aria-busy="true"
        aria-label="Loading page content"
      >
        <span className="sr-only">Loading page content</span>
        <div className="space-y-8 md:space-y-10">
          <div className="glass-card space-y-4 p-4 md:p-5">
            <div className="h-12 rounded-2xl bg-white/8" />
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`pill-${index}`} className="h-10 w-28 shrink-0 rounded-full bg-white/8" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`card-${index}`} className="glass-card h-64 p-4 md:p-5" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
