import type { User } from "@/shared/types/express";
import { Role, type Ticket } from "../../../generated/prisma/client";

export class TicketPolicy {
  view(user: User, ticket: Ticket): boolean {
    return user.role === Role.admin || user.id === ticket.creatorId;
  }
}