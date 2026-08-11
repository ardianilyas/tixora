import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";
import { TicketPriority, TicketStatus } from "../../../generated/prisma/enums";
import { seedCategory } from "./category.seeder";
import { seedUser } from "./user.seeder";

export type CreateTicketData = {
  code?: string;
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  creatorId?: string;
  asigneeId?: string;
  categoryId?: string;
  [key: string]: unknown;
};

export async function seedTicket(data: Partial<CreateTicketData> = {}) {
  let categoryId = data.categoryId;
  if (!categoryId) {
    const category = await seedCategory();
    if (!category) throw new Error("Failed to create category for ticket seed");
    categoryId = category.id;
  }

  let creatorId = data.creatorId;
  if (!creatorId) {
    const user = await seedUser();
    creatorId = user.id;
  }

  const count = await prisma.ticket.count();
  const code = data.code ?? `TXO-${String(count + 1).padStart(4, "0")}`;

  return prisma.ticket.create({
    data: {
      code,
      title: data.title ?? faker.lorem.sentence(),
      description: data.description ?? faker.lorem.paragraph(),
      status: data.status ?? TicketStatus.open,
      priority: data.priority ?? TicketPriority.low,
      creatorId,
      asigneeId: data.asigneeId,
      categoryId,
    },
  });
}

export async function seedTickets(length: number = 1, overrideData: Partial<CreateTicketData> = {}) {
  const tickets = [];
  for (let i = 0; i < length; i++) {
    const ticket = await seedTicket(overrideData);
    tickets.push(ticket);
  }
  return tickets;
}
