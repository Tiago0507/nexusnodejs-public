import mongoose from "mongoose";
import { nanoid10 } from "../utils/ids.js";
import { sha256Hex } from "../utils/crypto.js";
import { BadRequest, NotFound } from "../utils/errors.js";
import { findTicketTypeOrThrow, decrementStock } from "../repositories/event.repo.js";
import {
  createPurchaseDoc,
  attachTickets,
  findByIdPopulated,
  listByUser,
  listAll,
  updateById,
  softDeleteById,
} from "../repositories/purchase.repo.js";
import { insertManyTickets } from "../repositories/ticket.repo.js";

export async function createPurchase(
  userId: string,
  { eventId, typeId, quantity }: { eventId: string; typeId: string; quantity: number }
) {
  const session = await mongoose.startSession();
  let createdPurchaseId: mongoose.Types.ObjectId | undefined;

  try {
    await session.withTransaction(async () => {
      // 1) Leer y validar tipo de ticket
      const tt = await findTicketTypeOrThrow(eventId, typeId, session);
      if (tt.quantityAvailable < quantity) throw BadRequest("Stock insuficiente");

      // 2) Descontar stock
      await decrementStock(eventId, typeId, quantity, session);

      const purchase = await createPurchaseDoc(
        {
          userId: new mongoose.Types.ObjectId(userId),
          eventId: new mongoose.Types.ObjectId(eventId),
          totalAmount: tt.price * quantity,
          status: "pending",
        },
        session
      );
      const pid = purchase._id;
      createdPurchaseId = pid;

      // 4) Tickets
      const docs = Array.from({ length: quantity }).map(() => {
        const code = nanoid10();
        return {
          code,
          qrHash: sha256Hex(code),
          userId: new mongoose.Types.ObjectId(userId),
          eventId: new mongoose.Types.ObjectId(eventId),
          typeId: new mongoose.Types.ObjectId(typeId),
          category: tt.category,
          price: tt.price,
          purchaseId: pid,
        };
      });

      const inserted = await insertManyTickets(docs, session);

      // 5) Asociar tickets a purchase
      await attachTickets(pid, inserted.map((t) => t._id), session);
    });

    // 6) Devolver purchase poblada
    const out = await findByIdPopulated(createdPurchaseId!);
    if (!out) throw NotFound("Purchase no encontrada");
    return out;
  } finally {
    session.endSession();
  }
}

export async function getUserPurchases(userId: string) {
  return listByUser(userId);
}

// NUEVO: listar todas (solo superadmin)
export async function getAllPurchases() {
  return listAll();
}

// NUEVO: obtener por id
export async function getPurchaseById(id: string) {
  return findByIdPopulated(id);
}

// NUEVO: listar por usuario arbitrario (superadmin o dueño)
export async function getPurchasesByUser(userId: string) {
  return listByUser(userId);
}

// NUEVO: actualizar por id (status u otros campos permitidos)
export async function updatePurchaseById(id: string, payload: any) {
  const updated = await updateById(id, payload);
  if (!updated) throw NotFound("Purchase no encontrada");
  return updated;
}

// NUEVO: borrado lógico
export async function softDeletePurchaseById(id: string) {
  const ok = await softDeleteById(id);
  if (!ok) throw NotFound("Purchase no encontrada");
  return { ok: true, id };
}
