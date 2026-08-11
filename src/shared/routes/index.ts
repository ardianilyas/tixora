import { Router } from "express";
import categoryRoute from "../../feature/category/category.route";

const router = Router();

router.use("/categories", categoryRoute);

export default router;