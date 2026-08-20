import type { AuthenticatedRequest } from "@/shared/types";
import { asyncHandler } from "@/shared/utils/async-handler";
import { sendSuccess } from "@/shared/utils/response";
import { validate } from "@/shared/utils/validate";
import { TICKET_SUCCESS_MESSAGE } from "./ticket.constant";
import { assignTicketToAgentDto, createTicketDto, getTicketId, updateTicketDto, updateTicketStatusDto } from "./ticket.dto";
import type { TicketService } from "./ticket.service";
import type { Request, Response } from "express";

export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  getTickets = asyncHandler(async(req: Request, res: Response) => {
    const tickets = await this.ticketService.getTickets(req.query, req);
    sendSuccess(res, TICKET_SUCCESS_MESSAGE.GET_TICKETS, tickets);
  });

  getTicket = asyncHandler(async(req: Request, res: Response) => {
    const id = validate(getTicketId, req.params.id);
    const ticket = await this.ticketService.getTicket(id);
    sendSuccess(res, TICKET_SUCCESS_MESSAGE.GET_TICKET, ticket);
  });

  createTicket = asyncHandler(async(req: AuthenticatedRequest, res: Response) => {
    const data = validate(createTicketDto, req.body);
    const ticket = await this.ticketService.createTicket(data, req.auth.user.id);
    sendSuccess(res, TICKET_SUCCESS_MESSAGE.CREATE_TICKET, ticket, 201);
  });

  updateTicket = asyncHandler(async(req: Request, res: Response) => {
    const id = validate(getTicketId, req.params.id);
    const data = validate(updateTicketDto, req.body);
    const ticket = await this.ticketService.updateTicket(data, id);
    sendSuccess(res, TICKET_SUCCESS_MESSAGE.UPDATE_TICKET, ticket);
  });

  deleteTicket = asyncHandler(async(req: Request, res: Response) => {
    const id = validate(getTicketId, req.params.id);
    await this.ticketService.deleteTicket(id);
    sendSuccess(res, "", null, 204);
  });

  updateTicketStatus = asyncHandler(async(req: Request, res: Response) => {
    const id = validate(getTicketId, req.params.id);
    const status = validate(updateTicketStatusDto, req.body);
    const ticket = await this.ticketService.updateTicketStatus(status["status"], id);
    sendSuccess(res, TICKET_SUCCESS_MESSAGE.UPDATE_TICKET_STATUS, ticket);
  });

  assignTicketToAgent = asyncHandler(async(req: Request, res: Response) => {
    const { assigneeId } = validate(assignTicketToAgentDto, req.body);
    const ticketId = validate(getTicketId, req.params.id);
    const ticket = await this.ticketService.assignTicketToAgent(assigneeId, ticketId);
    sendSuccess(res, TICKET_SUCCESS_MESSAGE.ASSIGN_TICKET_TO_AGENT, ticket);
  });
}
