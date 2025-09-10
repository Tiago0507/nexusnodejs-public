import { Router } from "express";
import {
  postValidateTicket,
  getTickets,
  getTicketsForEvent,
  getTicket,
  postTicket,
  putTicket,
  deleteTicket,
} from "../controllers/ticket.controller.js";
import { auth } from "../middlewares/auth.js";
import { rbac } from "../middlewares/rbac.js";
import { validate } from "../middlewares/validate.js";
import rateLimit from "../middlewares/rateLimit.js";
import { ValidateTicketDTO } from "../validators/ticket.validators.js";
// Si tienes DTOs para crear/editar ticket, impórtalos aquí
// import { CreateTicketDTO, UpdateTicketDTO } from "../validators/ticket.validators.js";

const r = Router();

// VALIDACIÓN EN PUERTA
r.post(
  "/validate",
  auth,
  rbac(["checker", "organizer", "superadmin"]),
  rateLimit({ windowMs: 60_000, max: 60 }),
  validate(ValidateTicketDTO),
  postValidateTicket
);

// CRUD (para la entrega)
r.get("/", auth, rbac(["superadmin"]), getTickets); // listado global
r.get("/event/:eventId", getTicketsForEvent); // público o autenticado, como prefieras
r.get("/:id", auth, getTicket);

r.post("/", auth, rbac(["organizer", "superadmin"]), /* validate(CreateTicketDTO), */ postTicket);
r.put("/:id", auth, rbac(["organizer", "superadmin"]), /* validate(UpdateTicketDTO), */ putTicket);
r.delete("/:id", auth, rbac(["organizer", "superadmin"]), deleteTicket);

export default r;
