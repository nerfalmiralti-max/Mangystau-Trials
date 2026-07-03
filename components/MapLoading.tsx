export default function MapLoading() {
  return (
    <div
      className="flex h-[400px] items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-white/50 sm:h-[520px] sm:rounded-[22px]"
      aria-busy="true"
      aria-label="Loading map"
      role="status"
    >
      <div className="h-8 w-36 rounded-full border border-white/10 bg-white/5" />
    </div>
  );
}
