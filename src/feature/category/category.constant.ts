export const CATEGORY_SUCCESS_MESSAGE = {
  GET_CATEGORIES: "Categories fetched successfully",
  GET_CATEGORY: "Category fetched successfully",
  CREATE_CATEGORY: "Category created successfully",
  UPDATE_CATEGORY: "Category updated successfully",
}
export const CATEGORY_NOT_FOUND_MESSAGE = "Category not found";

export const CATEGORY_TEST_ROUTE = {
  GET_CATEGORIES: "/api/categories",
  GET_CATEGORY: (id: string) => `/api/categories/${id}`,
  CREATE_CATEGORY: "/api/categories",
  UPDATE_CATEGORY: (id: string) => `/api/categories/${id}`,
  DELETE_CATEGORY: (id: string) => `/api/categories/${id}`,
}