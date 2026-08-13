import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";
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
};

/**
 * Seed Ticket factory function.
 *
 * Usage:
 * - seedTicket()                            -> Creates 1 ticket
 * - seedTicket({ priority: "high" })       -> Creates 1 ticket with overrides
 * - seedTicket(5)                           -> Creates 5 tickets
 * - seedTicket(5, { status: "resolved" })   -> Creates 5 tickets with overrides
 */
export async function seedTicket(overrides?: CreateTicketData): Promise<Ticket>;
export async function seedTicket(count: 1, overrides?: CreateTicketData): Promise<Ticket>;
export async function seedTicket(count: number, overrides?: CreateTicketData): Promise<Ticket[]>;
export async function seedTicket(
  countOrOverrides: number | CreateTicketData = 1,
  overrideData: CreateTicketData = {}
): Promise<Ticket | Ticket[]> {
  const count = typeof countOrOverrides === "number" ? countOrOverrides : 1;
  const overrides = typeof countOrOverrides === "object" ? countOrOverrides : overrideData;

  const tickets: Ticket[] = [];

  for (let i = 0; i < count; i++) {
    const categoryId = overrides.categoryId ?? (await seedCategory()).id;
    const creatorId = overrides.creatorId ?? (await seedUser()).id;

    let code = overrides.code;
    if (!code || count > 1) {
      const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
      code = overrides.code && count === 1 ? overrides.code : `TXO-${Date.now().toString(36).toUpperCase()}-${randomId}-${i}`;
    }

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
      },
    });

    tickets.push(ticket);
  }

  if (count === 1) {
    return tickets[0]!;
  }

  return tickets;
}
