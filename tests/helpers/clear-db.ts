import { prisma } from "../../src/db";

export async function clearDb() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "user", "session", "account", "verification" RESTART IDENTITY CASCADE;
  `);
}