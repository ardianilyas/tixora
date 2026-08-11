import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../server";
import { authenticate } from "../../../tests/helpers/auth.helper";
import { TICKET_NOT_FOUND_MESSAGE, TICKET_SUCCESS_MESSAGE, TICKET_TEST_ROUTE } from "./ticket.constant";
import { seedCategory } from "../../shared/seeder/category.seeder";
import { seedTicket } from "../../shared/seeder/ticket.seeder";
import { TicketPriority, TicketStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../shared/lib/prisma";

describe("Ticket feature tests", () => {
  const invalidId = "invalid-ticket-id";
  let categoryId: string;
  let sampleTicketId: string;

  beforeEach(async () => {
    const category = await seedCategory();
    if (!category) throw new Error("Category seed failed");
    categoryId = category.id;

    const ticket = await seedTicket({ categoryId });
    sampleTicketId = ticket.id;
  });

  describe("GET /api/tickets", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app).get(TICKET_TEST_ROUTE.GET_TICKETS);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 200 and list of tickets when user is authenticated", async () => {
      const auth = await authenticate();
      const response = await auth.agent.get(TICKET_TEST_ROUTE.GET_TICKETS);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(TICKET_SUCCESS_MESSAGE.GET_TICKETS);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should filter tickets by creatorId", async () => {
      const auth = await authenticate();
      const userTicket = await seedTicket({ creatorId: auth.user.id, categoryId });

      const response = await auth.agent
        .get(TICKET_TEST_ROUTE.GET_TICKETS)
        .query({ creatorId: auth.user.id });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((t: any) => t.creatorId === auth.user.id)).toBe(true);
    });

    it("should filter tickets by assigneeId", async () => {
      const auth = await authenticate();
      const assigneeTicket = await seedTicket({ asigneeId: auth.user.id, categoryId });

      const response = await auth.agent
        .get(TICKET_TEST_ROUTE.GET_TICKETS)
        .query({ assigneeId: auth.user.id });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(assigneeTicket.id);
    });

    it("should filter tickets by code", async () => {
      const auth = await authenticate();
      const customTicket = await seedTicket({ code: "TXO-9999", categoryId });

      const response = await auth.agent
        .get(TICKET_TEST_ROUTE.GET_TICKETS)
        .query({ code: "TXO-9999" });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].code).toBe("TXO-9999");
    });

    it("should filter tickets by status", async () => {
      const auth = await authenticate();
      await seedTicket({ status: TicketStatus.in_progress, categoryId });
      await seedTicket({ status: TicketStatus.resolved, categoryId });

      const response = await auth.agent
        .get(TICKET_TEST_ROUTE.GET_TICKETS)
        .query({ status: TicketStatus.in_progress });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((t: any) => t.status === TicketStatus.in_progress)).toBe(true);
    });

    it("should filter tickets by priority", async () => {
      const auth = await authenticate();
      await seedTicket({ priority: TicketPriority.critical, categoryId });

      const response = await auth.agent
        .get(TICKET_TEST_ROUTE.GET_TICKETS)
        .query({ priority: TicketPriority.critical });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every((t: any) => t.priority === TicketPriority.critical)).toBe(true);
    });

    it("should filter tickets by combined parameters (status and priority)", async () => {
      const auth = await authenticate();
      await seedTicket({
        status: TicketStatus.resolved,
        priority: TicketPriority.high,
        categoryId,
      });

      const response = await auth.agent
        .get(TICKET_TEST_ROUTE.GET_TICKETS)
        .query({ status: TicketStatus.resolved, priority: TicketPriority.high });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.every(
          (t: any) => t.status === TicketStatus.resolved && t.priority === TicketPriority.high
        )
      ).toBe(true);
    });
  });

  describe("GET /api/tickets/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app).get(TICKET_TEST_ROUTE.GET_TICKET(sampleTicketId));
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 404 when ticket is not found", async () => {
      const auth = await authenticate();
      const response = await auth.agent.get(TICKET_TEST_ROUTE.GET_TICKET(invalidId));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(TICKET_NOT_FOUND_MESSAGE);
    });

    it("should return 200 and ticket details when found", async () => {
      const auth = await authenticate();
      const response = await auth.agent.get(TICKET_TEST_ROUTE.GET_TICKET(sampleTicketId));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(TICKET_SUCCESS_MESSAGE.GET_TICKET);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(sampleTicketId);
    });
  });

  describe("POST /api/tickets", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app).post(TICKET_TEST_ROUTE.CREATE_TICKET).send({
        title: "Test Ticket",
        description: "Test Description",
        categoryId,
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 400 validation error when required fields are missing", async () => {
      const auth = await authenticate();
      const response = await auth.agent.post(TICKET_TEST_ROUTE.CREATE_TICKET).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation Error");
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it("should return 400 validation error when fields are empty strings", async () => {
      const auth = await authenticate();
      const response = await auth.agent.post(TICKET_TEST_ROUTE.CREATE_TICKET).send({
        title: "",
        description: "",
        categoryId: "",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation Error");
    });

    it("should return 400 validation error when enum values are invalid", async () => {
      const auth = await authenticate();
      const response = await auth.agent.post(TICKET_TEST_ROUTE.CREATE_TICKET).send({
        title: "Valid Title",
        description: "Valid Description",
        categoryId,
        status: "INVALID_STATUS",
        priority: "INVALID_PRIORITY",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation Error");
    });

    it("should return 400 when categoryId does not exist in DB", async () => {
      const auth = await authenticate();
      const response = await auth.agent.post(TICKET_TEST_ROUTE.CREATE_TICKET).send({
        title: "Valid Title",
        description: "Valid Description",
        categoryId: "non-existent-category-id",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Foreign key constraint failed");
    });

    it("should return 201 and create ticket with defaults (status: open, priority: low)", async () => {
      const auth = await authenticate();
      const payload = {
        title: "New Ticket Title",
        description: "New Ticket Description",
        categoryId,
      };

      const response = await auth.agent.post(TICKET_TEST_ROUTE.CREATE_TICKET).send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(TICKET_SUCCESS_MESSAGE.CREATE_TICKET);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBe(payload.title);
      expect(response.body.data.description).toBe(payload.description);
      expect(response.body.data.categoryId).toBe(categoryId);
      expect(response.body.data.status).toBe(TicketStatus.open);
      expect(response.body.data.priority).toBe(TicketPriority.low);
      expect(response.body.data.creatorId).toBe(auth.user.id);
      expect(response.body.data.code).toMatch(/^TXO-\d{4}$/);
    });

    it("should return 201 and create ticket with explicit status and priority", async () => {
      const auth = await authenticate();
      const payload = {
        title: "High Priority Bug",
        description: "Critical issue in production",
        categoryId,
        status: TicketStatus.in_progress,
        priority: TicketPriority.high,
      };

      const response = await auth.agent.post(TICKET_TEST_ROUTE.CREATE_TICKET).send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe(TicketStatus.in_progress);
      expect(response.body.data.priority).toBe(TicketPriority.high);
    });
  });

  describe("PATCH /api/tickets/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app)
        .patch(TICKET_TEST_ROUTE.UPDATE_TICKET(sampleTicketId))
        .send({ title: "Updated Title" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 404 when ticket does not exist", async () => {
      const auth = await authenticate();
      const response = await auth.agent
        .patch(TICKET_TEST_ROUTE.UPDATE_TICKET(invalidId))
        .send({ title: "Updated Title" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(TICKET_NOT_FOUND_MESSAGE);
    });

    it("should return 400 validation error when status enum is invalid", async () => {
      const auth = await authenticate();
      const response = await auth.agent
        .patch(TICKET_TEST_ROUTE.UPDATE_TICKET(sampleTicketId))
        .send({ status: "NON_EXISTENT_STATUS" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation Error");
    });

    it("should return 200 and perform partial update (updating status and priority)", async () => {
      const auth = await authenticate();
      const response = await auth.agent
        .patch(TICKET_TEST_ROUTE.UPDATE_TICKET(sampleTicketId))
        .send({
          status: TicketStatus.resolved,
          priority: TicketPriority.critical,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(TICKET_SUCCESS_MESSAGE.UPDATE_TICKET);
      expect(response.body.data.status).toBe(TicketStatus.resolved);
      expect(response.body.data.priority).toBe(TicketPriority.critical);
    });

    it("should return 200 and perform full update", async () => {
      const auth = await authenticate();
      const newCategory = await seedCategory();
      const payload = {
        title: "Fully Updated Title",
        description: "Fully Updated Description",
        categoryId: newCategory!.id,
        status: TicketStatus.in_progress,
        priority: TicketPriority.medium,
      };

      const response = await auth.agent
        .patch(TICKET_TEST_ROUTE.UPDATE_TICKET(sampleTicketId))
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe(payload.title);
      expect(response.body.data.description).toBe(payload.description);
      expect(response.body.data.categoryId).toBe(payload.categoryId);
      expect(response.body.data.status).toBe(payload.status);
      expect(response.body.data.priority).toBe(payload.priority);
    });
  });

  describe("DELETE /api/tickets/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const response = await request(app).delete(TICKET_TEST_ROUTE.DELETE_TICKET(sampleTicketId));
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Unauthorized");
    });

    it("should return 404 when ticket does not exist", async () => {
      const auth = await authenticate();
      const response = await auth.agent.delete(TICKET_TEST_ROUTE.DELETE_TICKET(invalidId));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(TICKET_NOT_FOUND_MESSAGE);
    });

    it("should return 204 and delete ticket from database", async () => {
      const auth = await authenticate();
      const response = await auth.agent.delete(TICKET_TEST_ROUTE.DELETE_TICKET(sampleTicketId));

      expect(response.status).toBe(204);

      // Verify deletion in database
      const deletedTicket = await prisma.ticket.findUnique({
        where: { id: sampleTicketId },
      });
      expect(deletedTicket).toBeNull();
    });
  });
});
