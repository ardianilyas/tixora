import { TicketService } from "@/feature/ticket/ticket.service";
import { QueueName, type JobDefinition } from "@/shared/queue/queue.types";

const ticketService = new TicketService();

export interface CloseExpiredTicketsResult {
  closedTicketCount: number;
}

export const closeExpiredTicketsJob: JobDefinition<Record<string, never>, CloseExpiredTicketsResult> = {
  name: "close-expired-tickets",
  queue: QueueName.TICKET,
  schedule: {
    // Run every minute (or custom cron pattern)
    pattern: "*/1 * * * *",
  },
  defaultData: {},
  handler: async () => {
    const closedTicketCount = await ticketService.closeExpiredOpenTickets();
    console.log(`[TicketJob] Successfully closed ${closedTicketCount} expired ticket(s).`);
    return {
      closedTicketCount,
    };
  },
};
