import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Map",
  description:
    "Explore Kazakhstan and Mangystau places on an interactive map with instant filtering, route previews and destination details.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Explore Map | MangystauTrails",
    description:
      "Interactive map for Kazakhstan attractions with filters, routes, editorial scores and destination highlights.",
    type: "website",
    url: "/explore",
    siteName: "MangystauTrails",
    images: ["/locations/photos/tuzbair.jpg"],
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
