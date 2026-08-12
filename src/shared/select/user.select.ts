import type { Prisma } from "../../../generated/prisma/client";

export const userSelect = {
  id: true,
  email: true,
  name: true
} satisfies Prisma.UserSelect;