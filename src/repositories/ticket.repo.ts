import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";

/* ====================== Tickets emitidos (no categorías) ====================== */

export async function insertManyTickets(
  docs: Array<{
    code: string; qrHash: string;
    userId: mongoose.Types.ObjectId; eventId: mongoose.Types.ObjectId;
    typeId: mongoose.Types.ObjectId; category?: string; price: number;
    purchaseId: mongoose.Types.ObjectId;
  }>,
  session: mongoose.ClientSession
) {
  return Ticket.insertMany(docs, { session });
}

export async function validateTicketOnce(eventId: string, code: string) {
  return Ticket.findOneAndUpdate(
    { eventId, code, isValidated: false },
    { $set: { isValidated: true, validatedAt: new Date() } },
    { new: true }
  ).lean();
}

export async function listAllTickets() {
  return Ticket.find({}).sort({ createdAt: -1 }).lean();
}

export async function listTicketsByEvent(eventId: string) {
  return Ticket.find({ eventId }).sort({ createdAt: -1 }).lean();
}

export async function findTicketById(id: string) {
  return Ticket.findById(id).lean();
}
