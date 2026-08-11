import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";

export type CreateCategoryData = {
  name?: string;
  description?: string;
  [key: string]: unknown;
}

export async function seedCategories(length: number = 1, data: CreateCategoryData = {}) {
  try {
    const categories = Array.from({ length }, (_, index) => ({
      name: data.name ?? faker.commerce.department(),
      description: data.description ?? faker.commerce.productDescription(),
      ...data
    }));

    const result = await prisma.category.createMany({
      data: categories,
      skipDuplicates: true
    });

    console.log(`Created ${result.count} categories`);
  } catch (error) {
    console.error(error);
  }
}

export async function seedCategory() {
  try {
    const data = {
      name: faker.commerce.department(),
      description: faker.commerce.productDescription()
    };

    return prisma.category.create({
      data
    });
  } catch (error) {
    console.error(error);
  }
}