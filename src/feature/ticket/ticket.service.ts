import { prisma } from "@/shared/lib/prisma";
import { userSelect } from "@/shared/select/user.select";
import { paginate } from "@/shared/utils/paginate";
import type { Request } from "express";
import type { TicketQuery } from "./ticket.constant";
import type { CreateTicketDto, UpdateTicketDto, UpdateTicketStatusDto } from "./ticket.dto";
import type { User } from "@/shared/types/express";
import type { TicketPolicy } from "./ticket.policy";
import { ForbiddenError } from "@/shared/errors/forbidden";

export class TicketService {
  constructor(private readonly ticketPolicy: TicketPolicy) {}

  async getTickets(query: TicketQuery, req?: Request) {
    const where = {
      creatorId: query.creatorId,
      assigneeId: query.assigneeId,
      code: query.code,
      status: query.status,
      priority: query.priority,
    };

    return paginate(prisma.ticket, {
      where,
      orderBy: { createdAt: "desc" },
      cursor: query.cursor,
      limit: query.limit,
      direction: query.direction,
      req,
    });
  }

  async getTicket(id: string, user: User) {
    const ticketData = await prisma.ticket.findUniqueOrThrow({
      where: {
        id
      },
      include: {
        creator: {
          select: userSelect
        },
        comments: {
          include: {
            author: {
              select: userSelect
            }
          }
        }
      }
    });

    if(!this.ticketPolicy.view(user, ticketData)) {
      throw new ForbiddenError("Forbidden to access this resource");
    }

    return ticketData;
  }

  async countTicket() {
    return prisma.ticket.count();
  }

  async createTicket(data: CreateTicketDto, creatorId: string) {
    const count = await this.countTicket();
    const code = `TXO-${String(count + 1).padStart(4, "0")}`;

    return prisma.ticket.create({
      data: {
        ...data,
        code,
        creatorId
      }
    });
  }

  async updateTicket(data: UpdateTicketDto, id: string) {
    return prisma.ticket.update({
      where: {
        id
      },
      data
    });
  }

  async deleteTicket(id: string) {
    return prisma.ticket.delete({
      where: {
        id
      }
    });
  }

  async updateTicketStatus(status: UpdateTicketStatusDto["status"], id: string) {
    return prisma.ticket.update({
      where: {
        id
      },
      data: {
        status
      }
    });
  }

  async assignTicketToAgent(assigneeId: string, ticketId: string) {
    return prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        assigneeId
      }
    });
  }

  async closeExpiredOpenTickets() {
    const cutoffDate = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000,
    );
    const result = await prisma.ticket.updateMany({
      where: {
        status: "open",
        createdAt: {
          lte: cutoffDate,
        },
      },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
      },
    });

    return result.count;
  }
}