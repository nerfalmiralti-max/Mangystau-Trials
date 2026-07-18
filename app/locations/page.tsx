import type { Metadata } from "next";
import AnimatedHero from "@/components/AnimatedHero";
import LocationsCatalog from "@/components/LocationsCatalog";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse Mangystau and Kazakhstan destination cards with instant search, filters, sorting, ratings, reviews, favorites and route-ready travel details.",
  alternates: { canonical: "/locations" },
  openGraph: {
    title: "Destinations | MangystauTrails",
    description:
      "Instantly search, filter and compare Mangystau travel places with ratings, reviews, photos and route details.",
    type: "website",
    url: "/locations",
    siteName: "MangystauTrails",
    images: ["/locations/photos/bozzhyra.jpg"],
  },
};

export default function LocationsPage() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="locations" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <LocationsCatalog />
      </main>
    </div>
  );
}
