import { PrismaClient } from "@prisma/client";

// Prisma resolves `directUrl` when the client starts. Runtime traffic may use the
// pooled DATABASE_URL when a provider does not expose a separate direct endpoint.
process.env.DIRECT_URL ||= process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
