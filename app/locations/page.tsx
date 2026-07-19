import type { Metadata } from "next";
import AnimatedHero from "@/components/AnimatedHero";
import LocationsCatalog from "@/components/LocationsCatalog";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Browse Mangystau and Kazakhstan destination cards with instant search, filters, editorial scores, favorites and route-ready travel details.",
  alternates: { canonical: "/locations" },
  openGraph: {
    title: "Destinations | MangystauTrails",
    description:
      "Instantly search, filter and compare Mangystau travel places with editorial scores, photos and route details.",
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

      <main id="main-content" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <div id="locations-catalog" className="scroll-mt-24">
          <LocationsCatalog />
        </div>
      </main>
    </div>
  );
}
