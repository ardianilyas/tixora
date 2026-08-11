import { Router } from "express";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { requireRole } from "../../shared/middlewares/require-role";

const router = Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

router.use(authMiddleware);
router.get("/", categoryController.getCategories);

router.use(requireRole("admin"));
router.get("/:id", categoryController.getCategory);
router.post("/", categoryController.createCategory);
router.patch("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
