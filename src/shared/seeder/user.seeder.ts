import { faker } from "@faker-js/faker";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";
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

export async function seedUser(
  countOrOverrides: number | SeedUserData = 1,
  overrideData: SeedUserData = {}
): Promise<any> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  const users = await Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const randomId = Math.random().toString(36).substring(2, 9);
      const name = overrides.name
        ? (count === 1 ? overrides.name : `${overrides.name} ${i + 1}`)
        : faker.person.fullName();
      const email = overrides.email
        ? (count === 1 ? overrides.email : `user-${Date.now()}-${randomId}-${i}@example.com`)
        : `user-${Date.now()}-${randomId}-${i}@example.com`;
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

      return {
        ...updatedUser,
        plainPassword: password,
        token: res.token ?? undefined,
      };
    })
  );

  return count === 1 ? users[0]! : users;
}
