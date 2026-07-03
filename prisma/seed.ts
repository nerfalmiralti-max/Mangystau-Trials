import { PrismaClient } from "@prisma/client";
import { PLACES } from "../lib/siteData";

const prisma = new PrismaClient();

async function main() {
  await Promise.all(
    PLACES.map((place) =>
      prisma.place.upsert({
        where: { id: place.id },
        update: {
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
      })
    )
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
