import { Router } from "express";
import categoryRoute from "../../feature/category/category.route";
import ticketRoute from "../../feature/ticket/ticket.route";

const router = Router();

router.use("/categories", categoryRoute);
router.use("/tickets", ticketRoute);

export default router;