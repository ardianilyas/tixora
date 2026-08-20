import { prisma } from "@/shared/lib/prisma";
import { paginate, type PaginationQuery } from "@/shared/utils/paginate";
import type { Request } from "express";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.dto";

export class CategoryService {
  async getCategories(query: PaginationQuery = {}, req?: Request) {
    return await paginate(prisma.category, {
      cursor: query.cursor,
      limit: query.limit,
      direction: query.direction,
      req,
    });
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