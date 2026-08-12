import { prisma } from "../../shared/lib/prisma";
import { userSelect } from "../../shared/select/user.select";
import type { TicketQuery } from "./ticket.constant";
import type { CreateTicketDto, UpdateTicketDto, UpdateTicketStatusDto } from "./ticket.dto";

export class TicketService {
  async getTickets(query: TicketQuery) {
    const where = {
      creatorId: query.creatorId,
      asigneeId: query.assigneeId,
      code: query.code,
      status: query.status,
      priority: query.priority
    };

    return prisma.ticket.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getTicket(id: string) {
    return prisma.ticket.findUniqueOrThrow({
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
}