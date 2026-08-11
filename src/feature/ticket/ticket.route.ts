import { Router } from "express";
import { TicketService } from "./ticket.service";
import { TicketController } from "./ticket.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

const router = Router();

const ticketService = new TicketService();
const ticketController = new TicketController(ticketService);

router.use(authMiddleware);

router.get("/", ticketController.getTickets);
router.get("/:id", ticketController.getTicket);
router.post("/", ticketController.createTicket);
router.patch("/:id", ticketController.updateTicket);
router.delete("/:id", ticketController.deleteTicket);

export default router;
