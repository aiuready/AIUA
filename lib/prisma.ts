import { PrismaClient } from "@prisma/client";

// Shared Prisma client singleton.
// The app runs as a long-running container (not serverless), so a single
// pooled client is the correct, low-friction pattern per the TRD (S4.3).
// If any part of this app is later moved to a serverless platform, a
// connection pooler becomes mandatory - do not remove this singleton.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
