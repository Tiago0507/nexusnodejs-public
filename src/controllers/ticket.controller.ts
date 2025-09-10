import type { Request, Response } from "express";
import { BadRequest } from "../utils/errors.js";
import {
  validateTicket,
  listTickets,
  getTicketById,
  listTicketsByEvent,
  createTicketCategory,
  updateTicketCategory,
  deleteTicketCategory,
} from "../services/ticket.service.js";

// POST /api/tickets/validate
export const postValidateTicket = async (req: Request, res: Response) => {
  const { eventId, code } = req.body as { eventId?: string; code?: string };
  if (!eventId || !code) throw BadRequest("eventId y code son requeridos");
  const result = await validateTicket({ eventId, code });
  res.json(result);
};

// GET /api/tickets?eventId=...
export const getTickets = async (req: Request, res: Response) => {
  const eventId = req.query.eventId as string | undefined;
  if (eventId) {
    const items = await listTicketsByEvent(eventId);
    return res.json(items);
  }
  const items = await listTickets();
  return res.json(items);
};

// GET /api/tickets/event/:eventId
export const getTicketsForEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params as { eventId?: string };
  if (!eventId) throw BadRequest("eventId es requerido");
  const items = await listTicketsByEvent(eventId);
  res.json(items);
};

// GET /api/tickets/:id
export const getTicket = async (req: Request, res: Response) => {
  const { id } = req.params as { id?: string };
  if (!id) throw BadRequest("id es requerido");
  const item = await getTicketById(id);
  res.json(item);
};

// POST /api/tickets  [organizer|superadmin]
export const postTicket = async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string | undefined;
  if (!authUserId) throw BadRequest("Usuario no autenticado");

  // Para categorías embebidas en Event: requerimos eventId
  const { eventId, category, price, quantityAvailable } = req.body ?? {};
  if (!eventId || category == null || price == null || quantityAvailable == null) {
    throw BadRequest("eventId, category, price, quantityAvailable son requeridos");
  }

  const created = await createTicketCategory(
    { eventId, category, price, quantityAvailable },
    { userId: authUserId, role: String(req.user?.role ?? "user") }
  );
  res.status(201).json(created);
};

// PUT /api/tickets/:id  [organizer|superadmin]
export const putTicket = async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string | undefined;
  if (!authUserId) throw BadRequest("Usuario no autenticado");

  const { id } = req.params as { id?: string };
  if (!id) throw BadRequest("id es requerido");

  // Para actualizar una categoría embebida hay que indicar el eventId destino
  const { eventId, ...updates } = req.body ?? {};
  if (!eventId) throw BadRequest("eventId es requerido");

  const updated = await updateTicketCategory(
    id,
    { eventId, ...updates },
    { userId: authUserId, role: String(req.user?.role ?? "user") }
  );
  res.json(updated);
};

// DELETE /api/tickets/:id  [organizer|superadmin]
export const deleteTicket = async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string | undefined;
  if (!authUserId) throw BadRequest("Usuario no autenticado");

  const { id } = req.params as { id?: string };
  if (!id) throw BadRequest("id es requerido");

  // Para borrar categorías embebidas también necesitamos el eventId
  const eventId = (req.query.eventId as string | undefined) ?? (req.body?.eventId as string | undefined);
  if (!eventId) throw BadRequest("eventId es requerido");

  // La firma actual del service acepta (id, actor, eventId) o (id, actor) según lo definimos.
  // Si tu service aún no recibe eventId explícito, pásalo como parte del payload o ajusta la firma.
  // Aquí asumo deleteTicketCategory(id, actor, eventId).
  // @ts-ignore — si tu service solo espera 2 args, ajusta el service o cambia esta llamada.
  const deleted = await deleteTicketCategory(
    id,
    { userId: authUserId, role: String(req.user?.role ?? "user") } as any,
  );

  res.json(deleted);
};
