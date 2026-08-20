import { faker } from "@faker-js/faker";
import { prisma } from "@/shared/lib/prisma";
import { seedTicket } from "./ticket.seeder";
import { seedUser } from "./user.seeder";
import type { Comment } from "../../../generated/prisma/client";

export type CreateCommentData = {
  body?: string;
  authorId?: string;
  ticketId?: string;
};

export async function seedComment(
  countOrOverrides: number | CreateCommentData = 1,
  overrideData: CreateCommentData = {}
): Promise<any> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  if (count === 1) {
    const authorId = overrides.authorId ?? (await prisma.user.findFirst({ select: { id: true } }))?.id ?? (await seedUser()).id;
    const ticketId = overrides.ticketId ?? (await prisma.ticket.findFirst({ select: { id: true } }))?.id ?? (await seedTicket()).id;

    const comment = await prisma.comment.create({
      data: {
        body: overrides.body ?? faker.lorem.sentences(2),
        authorId,
        ticketId,
      },
    });

    return comment;
  }

  // Bulk comment creation with Array.from
  let userIds = (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id);
  if (userIds.length === 0) {
    const newUser = await seedUser();
    userIds = [newUser.id];
  }

  let ticketIds = (await prisma.ticket.findMany({ select: { id: true } })).map((t) => t.id);
  if (ticketIds.length === 0) {
    const newTicket = await seedTicket();
    ticketIds = [newTicket.id];
  }

  const data = Array.from({ length: count }, () => ({
    body: overrides.body ?? faker.lorem.sentences(2),
    authorId: overrides.authorId ?? faker.helpers.arrayElement(userIds),
    ticketId: overrides.ticketId ?? faker.helpers.arrayElement(ticketIds),
  }));

  const comments = await prisma.comment.createManyAndReturn({
    data,
  });

  return comments;
}
