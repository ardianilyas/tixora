import { prisma } from "@/shared/lib/prisma";
import type { CreateCommentDto } from "./comment.dto";

export class CommentService {
  async createComment(data: CreateCommentDto, authorId: string) {
    return prisma.comment.create({
      data: {
        ...data,
        authorId
      }
    });
  }
}