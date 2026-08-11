import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import { validate } from "../../shared/utils/validate";
import { CATEGORY_SUCCESS_MESSAGE } from "./category.constant";
import { createCategoryDto, getCategoryId, updateCategoryDto } from "./category.dto";
import type { CategoryService } from "./category.service";
import type { Request, Response } from "express";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getCategories = asyncHandler(async(req: Request, res: Response) => {
    const categories = await this.categoryService.getCategories();
    sendSuccess(res, CATEGORY_SUCCESS_MESSAGE.GET_CATEGORIES, categories);
  });

  getCategory = asyncHandler(async(req: Request, res: Response) => {
    const id = validate(getCategoryId, req.params.id);
    const category = await this.categoryService.getCategory(id);
    sendSuccess(res, CATEGORY_SUCCESS_MESSAGE.GET_CATEGORY, category);
  });

  createCategory = asyncHandler(async(req: Request, res: Response) => {
    const data = validate(createCategoryDto, req.body);
    const category = await this.categoryService.createCategory(data);
    sendSuccess(res, CATEGORY_SUCCESS_MESSAGE.CREATE_CATEGORY, category, 201);
  });

  updateCategory = asyncHandler(async(req: Request, res: Response) => {
    const id = validate(getCategoryId, req.params.id);
    const data = validate(updateCategoryDto, req.body);
    const category = await this.categoryService.updateCategory(id, data);
    sendSuccess(res, CATEGORY_SUCCESS_MESSAGE.UPDATE_CATEGORY, category);
  });

  deleteCategory = asyncHandler(async(req: Request, res: Response) => {
    const id = validate(getCategoryId, req.params.id);
    await this.categoryService.deleteCategory(id);
    sendSuccess(res, "", null, 204);
  });
}
