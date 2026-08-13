import { Router } from "express";
import { TicketService } from "./ticket.service";
import { TicketController } from "./ticket.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";
import { requireRole } from "../../shared/middlewares/require-role";

const router = Router();

const ticketService = new TicketService();
const ticketController = new TicketController(ticketService);

router.use(authMiddleware);

router.get("/", ticketController.getTickets);
router.get("/:id", ticketController.getTicket);
router.post("/", ticketController.createTicket);
router.patch("/:id", ticketController.updateTicket);
router.delete("/:id", ticketController.deleteTicket);

router.use(requireRole("admin"));
router.patch("/:id/status", ticketController.updateTicketStatus);
router.patch("/:id/assignee", ticketController.assignTicketToAgent);

export default router;
