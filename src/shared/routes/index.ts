import { Router } from "express";
import categoryRoute from "@/feature/category/category.route";
import ticketRoute from "@/feature/ticket/ticket.route";
import commentRoute from "@/feature/comment/comment.route";

const router = Router();

router.use("/categories", categoryRoute);
router.use("/tickets", ticketRoute);
router.use("/comments", commentRoute);

export default router;