import { Router } from "express";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const router = Router();

const commentService = new CommentService();
const commentController = new CommentController(commentService);

router.use(authMiddleware);

router.post("/", commentController.createComment);

export default router;
