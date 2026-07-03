import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Routes",
  description:
    "Build and compare Kazakhstan travel routes, including popular Mangystau routes from Aktau to Bozzhyra, Sherkala, Torysh and the Caspian Sea.",
  openGraph: {
    title: "Routes | MangystauTrails",
    description:
      "Popular Mangystau routes with distance, travel time, route points and interactive map previews.",
    type: "website",
    images: ["/locations/photos/sherkala.jpg"],
  },
};

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
