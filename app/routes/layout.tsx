import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Routes",
  description:
    "Build and compare Kazakhstan travel routes, including popular Mangystau routes from Aktau to Bozzhyra, Sherkala, Torysh and the Caspian Sea.",
  alternates: { canonical: "/routes" },
  openGraph: {
    title: "Routes | MangystauTrails",
    description:
      "Popular Mangystau routes with distance, travel time, route points and interactive map previews.",
    type: "website",
    url: "/routes",
    siteName: "MangystauTrails",
    images: ["/locations/photos/sherkala.jpg"],
  },
};

export default function RoutesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
