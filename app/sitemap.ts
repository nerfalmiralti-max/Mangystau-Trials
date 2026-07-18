import type { MetadataRoute } from "next";
import { PLACES } from "@/lib/siteData";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/locations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/routes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/chat`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const locationRoutes = PLACES.map((place) => ({
    url: `${SITE_URL}/locations/${place.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: place.region === "Mangystau" ? 0.85 : 0.65,
    images: place.image ? [`${SITE_URL}${place.image}`] : undefined,
  }));

  return [...staticRoutes, ...locationRoutes];
}
