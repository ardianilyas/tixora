import request from "supertest";
import app from "@/server";
import { prisma } from "@/shared/lib/prisma";
import type { UserRole } from "@/shared/types/express";

export async function authenticate(role: UserRole = "user", customEmail?: string) {
  const agent = request.agent(app);
  const randomId = Math.random().toString(36).substring(2, 9);
  const email = customEmail ?? `test-${Date.now()}-${randomId}@example.com`;

  const user = {
    name: "Test User",
    email,
    password: "password123"
  };

  await agent
    .post("/api/auth/sign-up/email")
    .send(user);

  const dbUser = await prisma.user.update({
    where: { email: user.email },
    data: { role }
  });

  await agent
    .post("/api/auth/sign-in/email")
    .send({
      email: user.email,
      password: user.password
    });

  return {
    user: {
      ...user,
      id: dbUser.id,
      role: dbUser.role
    },
    agent
  };
}