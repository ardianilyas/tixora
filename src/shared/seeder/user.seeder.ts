import { faker } from "@faker-js/faker";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import type { Role, User } from "../../../generated/prisma/client";

export type SeedUserData = {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  image?: string;
  emailVerified?: boolean;
};

export type SeededUser = User & {
  plainPassword?: string;
  token?: string;
};

/**
 * Seed User factory function.
 *
 * Usage:
 * - seedUser()                          -> Creates 1 user
 * - seedUser({ role: "admin" })         -> Creates 1 user with overrides
 * - seedUser(5)                         -> Creates 5 users
 * - seedUser(5, { role: "admin" })      -> Creates 5 users with overrides
 */
export async function seedUser(overrides?: SeedUserData): Promise<SeededUser>;
export async function seedUser(count: 1, overrides?: SeedUserData): Promise<SeededUser>;
export async function seedUser(count: number, overrides?: SeedUserData): Promise<SeededUser[]>;
export async function seedUser(
  countOrOverrides: number | SeedUserData = 1,
  overrideData: SeedUserData = {}
): Promise<SeededUser | SeededUser[]> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  const users: SeededUser[] = [];

  for (let i = 0; i < count; i++) {
    const randomId = Math.random().toString(36).substring(2, 9);
    const name = overrides.name ?? faker.person.fullName();
    const email = overrides.email ?? `user-${Date.now()}-${randomId}-${i}@example.com`;
    const password = overrides.password ?? "Password123!";
    const role = overrides.role ?? "user";

    const res = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!res?.user) {
      throw new Error("Failed to create user via better-auth");
    }

    const updatedUser = await prisma.user.update({
      where: { id: res.user.id },
      data: {
        role,
        image: overrides.image ?? res.user.image,
        emailVerified: overrides.emailVerified ?? res.user.emailVerified,
      },
    });

    users.push({
      ...updatedUser,
      plainPassword: password,
      token: res.token ?? undefined,
    });
  }

  if (count === 1) return users[0]!;
  return users;
}
