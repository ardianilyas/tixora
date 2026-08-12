import { prisma } from "../../src/shared/lib/prisma";

export async function clearDb() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "user", "session", "account", "verification", "categories", "tickets", "Comment" RESTART IDENTITY CASCADE;
  `);
}