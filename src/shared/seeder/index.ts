import { prisma } from "@/shared/lib/prisma";
import { seedCategory } from "@/shared/seeder/category.seeder";
import { seedComment } from "@/shared/seeder/comment.seeder";
import { seedTicket } from "@/shared/seeder/ticket.seeder";
import { seedUser } from "@/shared/seeder/user.seeder";

async function main() {
  console.log("🌱 Seeding database...");

  const users = await seedUser(5);
  console.log(`✅ Created ${users.length} users`);

  const categories = await seedCategory(50);
  console.log(`✅ Created ${categories.length} categories`);

  const tickets = await seedTicket(100);
  console.log(`✅ Created ${tickets.length} tickets`);

  const comments = await seedComment(150);
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