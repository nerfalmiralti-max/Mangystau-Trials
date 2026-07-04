import type { Metadata } from "next";
import AnimatedHero from "@/components/AnimatedHero";
import AnimatedTitle from "@/components/AnimatedTitle";
import MangystauGuideApp from "@/components/MangystauGuideApp";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "Compact Mangystau travel guide with nearby hotels, route planning, offline saving, weather notes and mobile bottom sheets.",
  openGraph: {
    title: "Guide | MangystauTrails",
    description:
      "Explore Mangystau attractions, hotels, routes and safety details in a compact travel app interface.",
    type: "website",
    images: ["/locations/photos/bozzhyra.jpg"],
  },
};

export default function ChatPage() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-white">
      <AnimatedHero activeTab="chat" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 md:pb-16 md:pt-12 lg:px-8">
        <div className="space-y-5">
          <AnimatedTitle text="Guide" className="text-3xl md:text-4xl" />
          <MangystauGuideApp />
        </div>
      </main>
    </div>
  );
}
