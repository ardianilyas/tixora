import { faker } from "@faker-js/faker";
import { prisma } from "@/shared/lib/prisma";
import { TicketPriority, TicketStatus } from "../../../generated/prisma/enums";
import { seedCategory } from "./category.seeder";
import { seedUser } from "./user.seeder";
import type { Ticket } from "../../../generated/prisma/client";

export type CreateTicketData = {
  code?: string;
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  creatorId?: string;
  assigneeId?: string;
  categoryId?: string;
  createdAt?: Date;
};

export async function seedTicket(overrides?: CreateTicketData): Promise<Ticket>;
export async function seedTicket(count: 1, overrides?: CreateTicketData): Promise<Ticket>;
export async function seedTicket(count: number, overrides?: CreateTicketData): Promise<Ticket[]>;
export async function seedTicket(
  countOrOverrides: number | CreateTicketData = 1,
  overrideData: CreateTicketData = {}
): Promise<Ticket | Ticket[]> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  // Single ticket creation
  if (count === 1) {
    const categoryId = overrides.categoryId ?? (await prisma.category.findFirst({ select: { id: true } }))?.id ?? (await seedCategory()).id;
    const creatorId = overrides.creatorId ?? (await prisma.user.findFirst({ select: { id: true } }))?.id ?? (await seedUser()).id;
    const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = overrides.code ?? `TXO-${Date.now().toString(36).toUpperCase()}-${randomId}-0`;

    const ticket = await prisma.ticket.create({
      data: {
        code,
        title: overrides.title ?? faker.lorem.sentence(),
        description: overrides.description ?? faker.lorem.paragraph(),
        status: overrides.status ?? TicketStatus.open,
        priority: overrides.priority ?? TicketPriority.low,
        creatorId,
        assigneeId: overrides.assigneeId,
        categoryId,
        createdAt: overrides.createdAt ?? new Date(),
      },
    });

    return ticket;
  }

  // Bulk ticket creation with Array.from
  let categoryIds = (await prisma.category.findMany({ select: { id: true } })).map((c) => c.id);
  if (categoryIds.length === 0) {
    const newCat = await seedCategory();
    categoryIds = [newCat.id];
  }

  let userIds = (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id);
  if (userIds.length === 0) {
    const newUser = await seedUser();
    userIds = [newUser.id];
  }

  const data = Array.from({ length: count }, (_, i) => {
    const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = overrides.code ? `${overrides.code}-${i}` : `TXO-${Date.now().toString(36).toUpperCase()}-${randomId}-${i}`;
    const categoryId = overrides.categoryId ?? faker.helpers.arrayElement(categoryIds);
    const creatorId = overrides.creatorId ?? faker.helpers.arrayElement(userIds);

    return {
      code,
      title: overrides.title ?? faker.lorem.sentence(),
      description: overrides.description ?? faker.lorem.paragraph(),
      status: overrides.status ?? TicketStatus.open,
      priority: overrides.priority ?? TicketPriority.low,
      creatorId,
      assigneeId: overrides.assigneeId,
      categoryId,
      createdAt: overrides.createdAt ?? faker.date.between({ from: twoMonthsAgo, to: new Date() }),
    };
  });

  const tickets = await prisma.ticket.createManyAndReturn({
    data,
  });

  return tickets;
}
