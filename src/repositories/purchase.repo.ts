import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";
import type { IPurchase } from "../models/Purchase.js";

export async function createPurchaseDoc(
  payload: Pick<IPurchase, "userId" | "eventId" | "totalAmount" | "status">,
  session: mongoose.ClientSession
): Promise<mongoose.HydratedDocument<IPurchase>> {
  const created = await Purchase.create([{ ...payload, ticketIds: [] }], { session });
  const doc = created[0];
  if (!doc) {
    throw new Error("No se pudo crear la compra");
  }
  return doc;
}

export async function attachTickets(
  purchaseId: mongoose.Types.ObjectId,
  ticketIds: mongoose.Types.ObjectId[],
  session: mongoose.ClientSession
): Promise<void> {
  await Purchase.updateOne({ _id: purchaseId }, { $set: { ticketIds } }).session(session);
}

export async function listByUser(userId: string) {
  return Purchase.find({ userId }).populate("ticketIds").sort({ purchaseDate: -1 }).lean();
}

export async function listAll() {
  return Purchase.find({}).populate("ticketIds").sort({ purchaseDate: -1 }).lean();
}

export async function findByIdPopulated(id: mongoose.Types.ObjectId | string) {
  return Purchase.findById(id).populate("ticketIds").lean();
}

export async function updateById(id: string, payload: Partial<IPurchase>) {
  const res = await Purchase.findByIdAndUpdate(id, payload, { new: true }).lean();
  return res; // puede ser null si no existe
}

/**
 * Borrado "lógico": si tu esquema no define deletedAt, hacemos deleteOne para no pelear con 'strict'.
 * Si prefieres soft real, cambia a: updateOne({_id:id}, {$set:{deletedAt:new Date()}})
 */
export async function softDeleteById(id: string) {
  const res = await Purchase.deleteOne({ _id: id });
  return res.deletedCount === 1;
}
