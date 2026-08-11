import type { TicketPriority, TicketStatus } from "../../../generated/prisma/enums";

export const TICKET_SUCCESS_MESSAGE = {
  GET_TICKETS: "Tickets fetched successfully",
  GET_TICKET: "Ticket fetched successfully",
  CREATE_TICKET: "Ticket created successfully",
  UPDATE_TICKET: "Ticket updated successfully",
}

export const TICKET_NOT_FOUND_MESSAGE = "Ticket not found";

export const TICKET_TEST_ROUTE = {
  GET_TICKETS: "/api/tickets",
  GET_TICKET: (id: string) => `/api/tickets/${id}`,
  CREATE_TICKET: "/api/tickets",
  UPDATE_TICKET: (id: string) => `/api/tickets/${id}`,
  DELETE_TICKET: (id: string) => `/api/tickets/${id}`,
};

export type TicketQuery = {
  creatorId?: string;
  assigneeId?: string;
  code?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
};

