import { prisma } from "../lib/prisma";
import { seedCategory } from "./category.seeder";
import { seedComment } from "./comment.seeder";
import { seedTicket } from "./ticket.seeder";
import { seedUser } from "./user.seeder";

async function main() {
  console.log("🌱 Seeding database...");

  const users = await seedUser(5);
  console.log(`✅ Created ${users.length} users`);

  const categories = await seedCategory(5);
  console.log(`✅ Created ${categories.length} categories`);

  const tickets = await seedTicket(10);
  console.log(`✅ Created ${tickets.length} tickets`);

  const comments = await seedComment(15);
  console.log(`✅ Created ${comments.length} comments`);

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });