import z from "zod";
import { TicketPriority, TicketStatus } from "../../../generated/prisma/enums";

export const createTicketDto = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(TicketStatus).default(TicketStatus.open),
  priority: z.enum(TicketPriority).default(TicketPriority.low),
});
export const updateTicketDto = createTicketDto.partial();
export const getTicketId = z.string();
export const updateTicketStatusDto = z.object({
  status: z.enum(TicketStatus),
});

export type CreateTicketDto = z.infer<typeof createTicketDto>;
export type UpdateTicketDto = z.infer<typeof updateTicketDto>;
export type GetTicketId = z.infer<typeof getTicketId>;
export type UpdateTicketStatusDto = z.infer<typeof updateTicketStatusDto>;
