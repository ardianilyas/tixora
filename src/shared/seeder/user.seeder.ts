import { faker } from "@faker-js/faker";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import type { Role } from "../../../generated/prisma/enums";

export type SeedUserData = {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  image?: string;
  emailVerified?: boolean;
};

export async function seedUser(data: SeedUserData = {}) {
  try {
    const randomId = Math.random().toString(36).substring(2, 9);
    const name = data.name ?? faker.person.fullName();
    const email = data.email ?? `user-${Date.now()}-${randomId}@example.com`;
    const password = data.password ?? "Password123!";
    const role = data.role ?? "user";

    const res = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!res?.user) {
      throw new Error("Failed to create user via better-auth");
    }

    const updatedUser = await prisma.user.update({
      where: { id: res.user.id },
      data: {
        role,
        image: data.image ?? res.user.image,
        emailVerified: data.emailVerified ?? res.user.emailVerified,
      },
    });

    return {
      ...updatedUser,
      plainPassword: password,
      token: res.token,
    };
  } catch (error) {
    console.error("Error seeding user:", error);
    throw error;
  }
}

export async function seedUsers(length: number = 1, overrideData: SeedUserData = {}) {
  const users = [];
  for (let i = 0; i < length; i++) {
    const user = await seedUser(overrideData);
    users.push(user);
  }
  console.log(`Created ${users.length} users`);
  return users;
}
