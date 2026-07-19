import type { PrismaClient } from "@prisma/client";
import { PLACES } from "@/lib/siteData";

export async function ensureStaticPlace(prisma: PrismaClient, placeId: string) {
  const place = PLACES.find((item) => item.id === placeId);
  if (!place) return null;

  return prisma.place.upsert({
    where: { id: place.id },
    update: {},
    create: {
      id: place.id,
      name: place.name,
      description: place.desc,
      region: place.region,
      category: place.category,
      duration: place.duration,
      bestTime: place.bestTime,
      lat: place.coordinates[0],
      lng: place.coordinates[1],
      image: place.image ?? null,
    },
    select: { id: true },
  });
}
