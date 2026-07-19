import { PrismaClient } from "@prisma/client";
import { PLACES } from "../lib/siteData";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.place.createMany({
    data: PLACES.map((place) => ({
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
    })),
    skipDuplicates: true,
  });

  console.info(`Seeded ${result.count} missing destination records.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
