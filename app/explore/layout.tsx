import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Map",
  description:
    "Explore Kazakhstan and Mangystau places on an interactive map with instant filtering, route previews and destination details.",
  openGraph: {
    title: "Explore Map | MangystauTrails",
    description:
      "Interactive map for Kazakhstan attractions with filters, routes, ratings and destination highlights.",
    type: "website",
    images: ["/locations/photos/tuzbair.jpg"],
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
