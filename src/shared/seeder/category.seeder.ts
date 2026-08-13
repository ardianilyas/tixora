import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";
import type { Category } from "../../../generated/prisma/client";

export type CreateCategoryData = {
  name?: string;
  description?: string;
};

/**
 * Generates default category attributes (Laravel Factory style).
 */
function makeCategoryData(overrides: CreateCategoryData = {}): CreateCategoryData {
  return {
    name: overrides.name ?? faker.commerce.department(),
    description: overrides.description ?? faker.commerce.productDescription(),
  };
}

/**
 * Seed Category factory function.
 *
 * Usage:
 * - seedCategory()                         -> Creates 1 category
 * - seedCategory({ name: "IT" })          -> Creates 1 category with overrides
 * - seedCategory(5)                        -> Creates 5 categories
 * - seedCategory(5, { description: "..."}) -> Creates 5 categories with overrides
 */
export async function seedCategory(overrides?: CreateCategoryData): Promise<Category>;
export async function seedCategory(count: 1, overrides?: CreateCategoryData): Promise<Category>;
export async function seedCategory(count: number, overrides?: CreateCategoryData): Promise<Category[]>;
export async function seedCategory(
  countOrOverrides: number | CreateCategoryData = 1,
  overrideData: CreateCategoryData = {}
): Promise<Category | Category[]> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  const categories: Category[] = [];

  for (let i = 0; i < count; i++) {
    const category = await prisma.category.create({
      data: makeCategoryData(overrides) as { name: string; description: string },
    });
    categories.push(category);
  }

  if (count === 1) return categories[0]!;
  return categories;
}