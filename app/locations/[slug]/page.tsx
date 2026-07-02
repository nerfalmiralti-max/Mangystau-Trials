import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPlaceBySlug } from "@/lib/siteData";
import AnimatedHero from "@/components/AnimatedHero";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LocationDetailPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="locations" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <section className="space-y-8 md:space-y-10">
          <div className="space-y-4 rounded-[20px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.25)] md:rounded-[26px] md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/40">{place.region}</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{place.name}</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 md:text-lg md:leading-8">{place.bio}</p>
                </div>
                {place.image ? (
                  <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#0f766e]/10 md:rounded-[24px]">
                    <Image
                      src={place.image}
                      alt={`${place.name} image`}
                      width={900}
                      height={500}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col items-start justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-[#0f766e] px-4 py-2 text-sm font-medium text-white">
                    {place.category}
                  </span>
                  <span className="rounded-full bg-[#f59e0b] px-4 py-2 text-sm font-medium text-slate-900">
                    {place.duration}
                  </span>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm text-white/70 md:rounded-[22px]">
                  <p className="font-semibold text-white">Best time to visit</p>
                  <p className="mt-2">{place.bestTime}</p>
                </div>
                <Link
                  href={`/chat?place=${place.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#f59e0b] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f7b42b]"
                >
                  Ask AI about {place.name}
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">Why visit</h2>
                  <p className="mt-4 leading-7 text-white/70">{place.desc}</p>
                </section>

                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">Practical information</h2>
                  <ul className="mt-4 space-y-3 text-white/70">
                    {(place.practicalInfo ?? [
                      `Best time to visit: ${place.bestTime}`,
                      `Recommended duration: ${place.duration}`,
                      "Plan for local transport and a comfortable layered wardrobe.",
                    ]).map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#f59e0b]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">Safety & responsible travel</h2>
                  <ul className="mt-4 space-y-3 text-white/70">
                    {(place.safetyTips ?? [
                      "Share your route details with someone before remote travel.",
                      "Carry extra water, food and a charged phone for desert or mountain roads.",
                      "Avoid night driving on unpaved roads, and follow local guide advice.",
                    ]).map((tip) => (
                      <li key={tip} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#0f766e]" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">Leave No Trace</h2>
                  <ul className="mt-4 space-y-3 text-white/70">
                    {(place.leaveNoTrace ?? [
                      "Respect fragile landscapes and leave no waste behind.",
                      "Stay on marked tracks, avoid disturbing wildlife and collect nothing.",
                      "Use reusable water bottles and minimize single-use plastics.",
                    ]).map((rule) => (
                      <li key={rule} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#f59e0b]" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                {place.gallery ? (
                  <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                    <h2 className="text-xl font-semibold text-white">Gallery</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {place.gallery.map((src) => (
                        <div key={src} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f766e]/10">
                          <Image src={src} alt={`${place.name} gallery`} width={500} height={300} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">Quick facts</h2>
                  <ul className="mt-4 space-y-3 text-white/70">
                    {place.facts.map((fact) => (
                      <li key={fact} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-white/60" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <Link
                  href={`/chat?place=${place.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#f59e0b] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f7b42b]"
                >
                  Ask AI about {place.name}
                </Link>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
