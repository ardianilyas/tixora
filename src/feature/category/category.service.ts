import { prisma } from "../../shared/lib/prisma";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";

export class CategoryService {
  async getCategories() {
    return await prisma.category.findMany();
  }

  async getCategory(id: string) {
    return await prisma.category.findUniqueOrThrow({
      where: {
        id
      }
    });
  }

  async createCategory(data: CreateCategoryDto) {
    return await prisma.category.create({
      data
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    return await prisma.category.update({
      where: {
        id
      },
      data
    });
  }

  async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: {
        id
      }
    });
  }
}