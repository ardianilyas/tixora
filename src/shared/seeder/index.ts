import { prisma } from "../lib/prisma";
import { seedCategories } from "./category.seeder";
import { seedTickets } from "./ticket.seeder";

async function main() {
  await seedCategories(12);
  await seedTickets(25);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
})