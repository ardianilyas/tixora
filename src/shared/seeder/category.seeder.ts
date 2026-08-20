import { faker } from "@faker-js/faker";
import { prisma } from "@/shared/lib/prisma";
import type { Category } from "../../../generated/prisma/client";

export type CreateCategoryData = {
  name?: string;
  description?: string;
};

export async function seedCategory(
  countOrOverrides: number | CreateCategoryData = 1,
  overrideData: CreateCategoryData = {}
): Promise<any> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  const data = Array.from({ length: count }, (_, i) => ({
    name: overrides.name
      ? (count === 1 ? overrides.name : `${overrides.name} ${i + 1}`)
      : `${faker.commerce.department()} ${Date.now().toString(36).toUpperCase()}-${i}`,
    description: overrides.description ?? faker.commerce.productDescription(),
  }));

  const categories = await prisma.category.createManyAndReturn({
    data,
  });

  return count === 1 ? categories[0]! : categories;
}