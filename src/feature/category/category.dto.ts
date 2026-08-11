import z from "zod";

export const createCategoryDto = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export const updateCategoryDto = createCategoryDto.partial();
export const getCategoryId = z.string();

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof updateCategoryDto>;
export type GetCategoryId = z.infer<typeof getCategoryId>;
