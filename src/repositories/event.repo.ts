import mongoose from "mongoose";
import Event from "../models/Event.js";
import { NotFound, BadRequest } from "../utils/errors.js";

/**
 * Devuelve el ticketType embebido dentro del Event (si está publicado)
 */
export async function findTicketTypeOrThrow(
  eventId: string,
  typeId: string,
  session?: mongoose.ClientSession
) {
  const event = await Event.findOne(
    { _id: eventId, "ticketTypes._id": typeId, status: "published" },
    { "ticketTypes.$": 1, _id: 1 }
  )
    .session(session ?? null)
    .lean();

  if (!event || !event.ticketTypes?.length) throw NotFound("Tipo de ticket no disponible");
  const tt = event.ticketTypes[0];
  return tt as { _id: any; category: string; price: number; quantityAvailable: number };
}

/**
 * Descuenta stock con guarda de no-negatividad.
 */
export async function decrementStock(
  eventId: string,
  typeId: string,
  quantity: number,
  session: mongoose.ClientSession
) {
  const res = await Event.updateOne(
    {
      _id: eventId,
      ticketTypes: { $elemMatch: { _id: typeId, quantityAvailable: { $gte: quantity } } },
    },
    { $inc: { "ticketTypes.$.quantityAvailable": -quantity } }
  ).session(session);

  if (res.modifiedCount !== 1) throw BadRequest("No se pudo actualizar stock");
}

/* ===================== CRUD de categorías (ticketTypes) ===================== */

/** Lista categorías por evento (solo publicadas si quieres; aquí no filtro por status) */
export async function listTicketTypesByEvent(eventId: string) {
  const event = await Event.findById(eventId, { ticketTypes: 1 }).lean();
  if (!event) throw NotFound("Evento no encontrado");
  return event.ticketTypes ?? [];
}

/** Crea una categoría dentro del evento */
export async function createTicketType(
  eventId: string,
  payload: { category: string; price: number; quantityAvailable: number }
) {
  const res = await Event.findByIdAndUpdate(
    eventId,
    { $push: { ticketTypes: payload } },
    { new: true, projection: { ticketTypes: { $slice: -1 } } }
  ).lean();

  if (!res || !res.ticketTypes?.length) throw BadRequest("No se pudo crear la categoría");
  return res.ticketTypes[0];
}

/** Actualiza una categoría específica */
export async function updateTicketType(
  eventId: string,
  typeId: string,
  payload: Partial<{ category: string; price: number; quantityAvailable: number }>
) {
  // Construye set dinámico con prefijo 'ticketTypes.$.'
  const $set: Record<string, unknown> = {};
  if (payload.category !== undefined) $set["ticketTypes.$.category"] = payload.category;
  if (payload.price !== undefined) $set["ticketTypes.$.price"] = payload.price;
  if (payload.quantityAvailable !== undefined) $set["ticketTypes.$.quantityAvailable"] = payload.quantityAvailable;

  const res = await Event.updateOne(
    { _id: eventId, "ticketTypes._id": typeId },
    { $set }
  );

  if (res.modifiedCount !== 1) throw NotFound("Categoría no encontrada");
  // Devuelve la categoría actualizada
  const ev = await Event.findOne(
    { _id: eventId, "ticketTypes._id": typeId },
    { "ticketTypes.$": 1 }
  ).lean();
  if (!ev || !ev.ticketTypes?.length) throw NotFound("Categoría no encontrada");
  return ev.ticketTypes[0];
}

/** Elimina una categoría específica */
export async function deleteTicketType(eventId: string, typeId: string) {
  const res = await Event.updateOne(
    { _id: eventId },
    { $pull: { ticketTypes: { _id: typeId } } }
  );
  if (res.modifiedCount !== 1) throw NotFound("Categoría no encontrada");
  return true;
}
