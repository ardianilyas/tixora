import type { AuthenticatedRequest } from "@/shared/types";
import { asyncHandler } from "@/shared/utils/async-handler";
import { sendSuccess } from "@/shared/utils/response";
import { validate } from "@/shared/utils/validate";
import { COMMENT_SUCCESS_MESSAGE } from "./comment.constant";
import { createCommentDto } from "./comment.dto";
import type { CommentService } from "./comment.service";
import type { Response } from "express";

export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  createComment = asyncHandler(async(req: AuthenticatedRequest, res: Response) => {
    const data = validate(createCommentDto, req.body);
    const comment = await this.commentService.createComment(data, req.auth.user.id);
    sendSuccess(res, COMMENT_SUCCESS_MESSAGE.CREATE_COMMENT, comment, 201);
  });
}