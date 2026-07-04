import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PLACES, getPlaceBySlug } from "@/lib/siteData";
import { buildDirectionsUrl, getPlaceTourism, getRelatedPlaces } from "@/lib/tourismData";
import AnimatedHero from "@/components/AnimatedHero";
import PlaceMemoryControls from "@/components/PlaceMemoryControls";

type LocationPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PLACES.map((place) => ({
    slug: place.id,
  }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    return {
      title: "Destination not found",
    };
  }

  const profile = getPlaceTourism(place);

  return {
    title: `${place.name} travel guide`,
    description: profile.seoDescription,
    openGraph: {
      title: `${place.name} | MangystauTrails`,
      description: profile.seoDescription,
      type: "article",
      images: profile.photo ? [profile.photo] : undefined,
    },
  };
}

export default async function LocationDetailPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  const profile = getPlaceTourism(place);
  const directionsUrl = buildDirectionsUrl(place);
  const relatedPlaces = getRelatedPlaces(place, 3);
  const [lat, lng] = place.coordinates;
  const gallery = place.gallery?.length ? place.gallery : profile.photo ? [profile.photo] : [];

  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="locations" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <section className="space-y-8 md:space-y-10" aria-labelledby="location-title">
          <div className="space-y-6 rounded-[20px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.25)] md:rounded-[26px] md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
              <div className="space-y-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-white/40">{place.region}</p>
                  <h1 id="location-title" className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                    {place.name}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 md:text-lg md:leading-8">
                    {place.bio}
                  </p>
                </div>

                {profile.photo ? (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[18px] border border-white/10 bg-white/5 md:rounded-[24px]">
                    <Image
                      src={profile.photo}
                      alt={`${place.name} photo`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 720px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <aside className="flex flex-col gap-4" aria-label={`${place.name} quick actions`}>
                <div className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px]">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-medium text-white">
                      {profile.categoryLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black">
                      {profile.rating.toFixed(1)} rating
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/62">
                    Based on {profile.reviewCount} mock reviews. The shape is ready to connect to a backend review table.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <InfoTile label="Visit time" value={profile.visitTime} />
                  <InfoTile label="Best time" value={place.bestTime} />
                  <InfoTile label="Coordinates" value={`${lat.toFixed(3)}, ${lng.toFixed(3)}`} />
                  <InfoTile label="From Aktau" value={`${profile.distanceFromAktauKm} km`} />
                </div>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#f59e0b] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#f7b42b]"
                >
                  {"\u041f\u043e\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u043c\u0430\u0440\u0448\u0440\u0443\u0442"}
                </a>

                <PlaceMemoryControls placeId={place.id} placeName={place.name} />

                <Link
                  href={`/chat?place=${place.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Open guide for {place.name}
                </Link>
              </aside>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">Why visit</h2>
                  <p className="mt-4 leading-7 text-white/70">{place.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {profile.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/62"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">Tourist tips</h2>
                  <ul className="mt-4 space-y-3 text-white/70">
                    {profile.touristTips.map((tip) => (
                      <li key={tip} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#f59e0b]" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                  <h2 className="text-xl font-semibold text-white">User reviews</h2>
                  <div className="mt-4 grid gap-3">
                    {profile.reviews.map((review) => (
                      <article key={review.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-white">{review.title}</p>
                            <p className="mt-1 text-xs text-white/42">
                              {review.author} / {review.tripType} / {review.date}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/65">{review.text}</p>
                      </article>
                    ))}
                  </div>
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
              </div>

              <aside className="space-y-6">
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

                {gallery.length > 0 ? (
                  <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                    <h2 className="text-xl font-semibold text-white">Gallery</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {gallery.map((src) => (
                        <div
                          key={src}
                          className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                        >
                          <Image
                            src={src}
                            alt={`${place.name} gallery`}
                            fill
                            sizes="(max-width: 1024px) 50vw, 360px"
                            className="object-cover"
                          />
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
              </aside>
            </div>

            {relatedPlaces.length > 0 ? (
              <section className="rounded-[18px] border border-white/10 bg-white/5 p-5 md:rounded-[22px] md:p-6">
                <h2 className="text-xl font-semibold text-white">You may also like</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {relatedPlaces.map(({ place: relatedPlace, profile: relatedProfile }) => (
                    <Link
                      key={relatedPlace.id}
                      href={`/locations/${relatedPlace.id}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        {relatedProfile.categoryLabel}
                      </p>
                      <h3 className="mt-2 font-semibold text-white">{relatedPlace.name}</h3>
                      <p className="mt-2 text-xs leading-5 text-white/55">{relatedPlace.desc}</p>
                      <p className="mt-3 text-xs text-white/45">
                        {relatedProfile.rating.toFixed(1)} rating / {relatedProfile.visitTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm text-white/70 md:rounded-[22px]">
      <p className="text-xs uppercase tracking-[0.2em] text-white/38">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
