import { prisma } from "@/shared/lib/prisma";

export async function clearDb() {
  await prisma.$executeRawUnsafe(`
    DELETE FROM "comments";
    DELETE FROM "tickets";
    DELETE FROM "categories";
    DELETE FROM "verification";
    DELETE FROM "account";
    DELETE FROM "session";
    DELETE FROM "user";
  `);
}