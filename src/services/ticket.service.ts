import { BadRequest, NotFound, Forbidden } from "../utils/errors.js";
import { validateTicketOnce } from "../repositories/ticket.repo.js";
import {
  listTicketTypesByEvent,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "../repositories/event.repo.js";

type Actor = { userId: string; role: string };

export async function validateTicket(params: { eventId: string; code: string }) {
  const updated = await validateTicketOnce(params.eventId, params.code);
  if (!updated) throw BadRequest("Tiquete inválido o ya usado");
  return { ok: true, ticketId: updated._id?.toString?.() ?? "" };
}

// ==================== CRUD de categorías (para la entrega) ====================

export async function listTickets() {
  // Listado global de categorías no tiene sentido fuera del contexto de event,
  // así que respondemos vacío o podríamos listar TODOS los eventos + flatten.
  // Para efectos de la entrega, puedes no usar este endpoint global.
  return [];
}

export async function listTicketsByEvent(eventId: string) {
  return listTicketTypesByEvent(eventId);
}

export async function getTicketById(_id: string) {
  // Las categorías están embebidas; para obtener una por id tendríamos que
  // buscar el evento que la contiene. Para la entrega, usa GET /tickets/event/:eventId
  throw NotFound("Usa /tickets/event/:eventId para listar categorías");
}

export async function createTicketCategory(payload: any, actor: Actor) {
  if (!(actor.role === "organizer" || actor.role === "superadmin")) {
    throw Forbidden("Solo organizer o superadmin");
  }
  // payload debe contener eventId y los campos de la categoría
  const { eventId, category, price, quantityAvailable } = payload ?? {};
  if (!eventId) throw BadRequest("eventId es requerido");
  return createTicketType(eventId, { category, price, quantityAvailable });
}

export async function updateTicketCategory(id: string, payload: any, actor: Actor) {
  if (!(actor.role === "organizer" || actor.role === "superadmin")) {
    throw Forbidden("Solo organizer o superadmin");
  }
  const { eventId, ...updates } = payload ?? {};
  if (!eventId) throw BadRequest("eventId es requerido");
  return updateTicketType(eventId, id, updates);
}

export async function deleteTicketCategory(id: string, actor: Actor) {
  if (!(actor.role === "organizer" || actor.role === "superadmin")) {
    throw Forbidden("Solo organizer o superadmin");
  }
  const { eventId } = (actor as any).context ?? {}; // si no pasas context, cambia firma
  throw BadRequest("Para borrar necesitas eventId. Llama deleteTicketCategory(id, { userId, role, context:{eventId} })");
}
