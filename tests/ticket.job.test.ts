import { describe, expect, it } from "vitest";
import { prisma } from "@/shared/lib/prisma";
import { seedCategory } from "@/shared/seeder/category.seeder";
import { seedTicket } from "@/shared/seeder/ticket.seeder";
import { closeExpiredTicketsJob } from "@/feature/ticket/jobs";
import { TicketStatus } from "../generated/prisma/enums";

describe("Ticket Background Jobs", () => {
  describe("closeExpiredTicketsJob", () => {
    it("should close tickets that are open and older than 2 days", async () => {
      const category = await seedCategory();

      // 1. Expired open ticket (3 days ago)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const expiredTicket = await seedTicket({
        status: TicketStatus.open,
        categoryId: category.id,
      });
      await prisma.ticket.update({
        where: { id: expiredTicket.id },
        data: { createdAt: threeDaysAgo },
      });

      // 2. Recent open ticket (1 hour ago)
      const recentTicket = await seedTicket({
        status: TicketStatus.open,
        categoryId: category.id,
      });

      // 3. Already resolved ticket
      const resolvedTicket = await seedTicket({
        status: TicketStatus.resolved,
        categoryId: category.id,
      });
      await prisma.ticket.update({
        where: { id: resolvedTicket.id },
        data: { createdAt: threeDaysAgo },
      });

      // Execute job handler
      const result = await closeExpiredTicketsJob.handler({} as any);
      expect(result.closedTicketCount).toBeGreaterThanOrEqual(1);

      // Verify expired ticket was resolved and resolvedAt set
      const updatedExpiredTicket = await prisma.ticket.findUnique({
        where: { id: expiredTicket.id },
      });
      expect(updatedExpiredTicket?.status).toBe(TicketStatus.resolved);
      expect(updatedExpiredTicket?.resolvedAt).not.toBeNull();

      // Verify recent ticket remains open
      const updatedRecentTicket = await prisma.ticket.findUnique({
        where: { id: recentTicket.id },
      });
      expect(updatedRecentTicket?.status).toBe(TicketStatus.open);
      expect(updatedRecentTicket?.resolvedAt).toBeNull();
    });
  });
});
