import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";
import type { Comment } from "../../../generated/prisma";
import { seedTicket } from "./ticket.seeder";
import { seedUser } from "./user.seeder";

export type CreateCommentData = {
  body?: string;
  authorId?: string;
  ticketId?: string;
};

/**
 * Seed Comment factory function.
 *
 * Usage:
 * - seedComment()                             -> Creates 1 comment
 * - seedComment({ body: "Hello" })            -> Creates 1 comment with overrides
 * - seedComment(5)                            -> Creates 5 comments
 * - seedComment(5, { ticketId: "..." })       -> Creates 5 comments with overrides
 */
export async function seedComment(overrides?: CreateCommentData): Promise<Comment>;
export async function seedComment(count: 1, overrides?: CreateCommentData): Promise<Comment>;
export async function seedComment(count: number, overrides?: CreateCommentData): Promise<Comment[]>;
export async function seedComment(
  countOrOverrides: number | CreateCommentData = 1,
  overrideData: CreateCommentData = {}
): Promise<Comment | Comment[]> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  const comments: Comment[] = [];

  for (let i = 0; i < count; i++) {
    let authorId = overrides.authorId;
    if (!authorId) {
      const author = await seedUser();
      authorId = author.id;
    }

    let ticketId = overrides.ticketId;
    if (!ticketId) {
      const ticket = await seedTicket();
      ticketId = ticket.id;
    }

    const comment = await prisma.comment.create({
      data: {
        body: overrides.body ?? faker.lorem.sentences(2),
        authorId,
        ticketId,
      },
    });

    comments.push(comment);
  }

  return count === 1 ? comments[0] : comments;
}
