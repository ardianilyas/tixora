import { describe, expect, it } from "vitest";
import { seedCategory } from "@/shared/seeder/category.seeder";
import { seedComment } from "@/shared/seeder/comment.seeder";
import { seedTicket } from "@/shared/seeder/ticket.seeder";
import { seedUser } from "@/shared/seeder/user.seeder";

describe("Seeder Factory Tests (Laravel Factory Style)", () => {
  it("should seed single category with default and override data", async () => {
    const category = await seedCategory();
    expect(category).toHaveProperty("id");
    expect(category.name).toBeDefined();

    const customCategory = await seedCategory({ name: "DevOps" });
    expect(customCategory.name).toBe("DevOps");
  });

  it("should seed multiple categories when count > 1 is passed", async () => {
    const categories = await seedCategory(3);
    expect(Array.isArray(categories)).toBe(true);
    expect(categories).toHaveLength(3);
  });

  it("should seed single user and multiple users", async () => {
    const user = await seedUser();
    expect(user).toHaveProperty("id");
    expect(user.role).toBe("user");

    const admins = await seedUser(2, { role: "admin" });
    expect(Array.isArray(admins)).toBe(true);
    expect(admins).toHaveLength(2);
    expect(admins[0]!.role).toBe("admin");
    expect(admins[1]!.role).toBe("admin");
  });

  it("should seed single ticket and multiple tickets", async () => {
    const ticket = await seedTicket();
    expect(ticket).toHaveProperty("id");
    expect(ticket.code).toMatch(/^TXO-/);

    const tickets = await seedTicket(2, { priority: "critical" });
    expect(Array.isArray(tickets)).toBe(true);
    expect(tickets).toHaveLength(2);
    expect(tickets[0]!.priority).toBe("critical");
  });

  it("should seed single comment and multiple comments", async () => {
    const comment = await seedComment();
    expect(comment).toHaveProperty("id");
    expect(comment.body).toBeDefined();
    expect(comment.authorId).toBeDefined();
    expect(comment.ticketId).toBeDefined();

    const comments = await seedComment(3, { body: "Custom comment body" });
    expect(Array.isArray(comments)).toBe(true);
    expect(comments).toHaveLength(3);
    expect(comments[0]!.body).toBe("Custom comment body");
  });
});
