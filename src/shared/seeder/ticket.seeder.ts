import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";
import { TicketPriority, TicketStatus } from "../../../generated/prisma/enums";
import type { Ticket } from "../../../generated/prisma";
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
    let categoryId = overrides.categoryId;
    if (!categoryId) {
      const category = await seedCategory();
      categoryId = category.id;
    }

    let creatorId = overrides.creatorId;
    if (!creatorId) {
      const user = await seedUser();
      creatorId = user.id;
    }

    let code = overrides.code;
    if (!code) {
      const randomId = Math.random().toString(36).substring(2, 7).toUpperCase();
      code = `TXO-${Date.now().toString(36).toUpperCase()}-${randomId}-${i}`;
    }

    const ticket = await prisma.ticket.create({
      data: {
        code,
        title: overrides.title ?? faker.lorem.sentence(),
        description: overrides.description ?? faker.lorem.paragraph(),
        status: overrides.status ?? TicketStatus.open,
        priority: overrides.priority ?? TicketPriority.low,
        creatorId,
        asigneeId: overrides.asigneeId,
        categoryId,
      },
    });

    tickets.push(ticket);
  }

  return count === 1 ? tickets[0] : tickets;
}
