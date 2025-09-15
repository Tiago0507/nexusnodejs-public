import crypto from "crypto";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import TicketModel, { type TicketDocument } from "./ticket.model.js";

function genCode(): string {
  return crypto.randomBytes(4).toString("hex");
}
function genQrHash(): string {
  return crypto.createHash("sha256").update(crypto.randomUUID()).digest("hex");
}

export interface ListOpts {
  page?: number;
  limit?: number;
  eventId?: string;
  userId?: string;
  isValidated?: "true" | "false";
}

export class TicketService {
  async createOne(payload: {
    eventId: string;
    typeId: string;
    category: string;
    price: number;
    userId?: string;
    ticketCode?: string;
    qrCodeHash?: string;
  }): Promise<TicketDocument> {
    const doc = await TicketModel.create({
      ticketCode: payload.ticketCode || genCode(),
      qrCodeHash: payload.qrCodeHash || genQrHash(),
      typeId: new mongoose.Types.ObjectId(payload.typeId),
      category: payload.category,
      price: Number(payload.price),
      isValidated: false,
      eventId: new mongoose.Types.ObjectId(payload.eventId),
      userId: payload.userId ? new mongoose.Types.ObjectId(payload.userId) : undefined
    });
    return doc.toObject() as TicketDocument;
  }

  async list(opts: ListOpts) {
    const page = Math.max(1, Number(opts.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(opts.limit ?? 10)));
    const filter: any = {};
    if (opts.eventId) {
      if (!mongoose.isValidObjectId(opts.eventId)) throw createHttpError(400, "eventId inválido");
      filter.eventId = new mongoose.Types.ObjectId(opts.eventId);
    }
    if (opts.userId) {
      if (!mongoose.isValidObjectId(opts.userId)) throw createHttpError(400, "userId inválido");
      filter.userId = new mongoose.Types.ObjectId(opts.userId);
    }
    if (opts.isValidated === "true") filter.isValidated = true;
    if (opts.isValidated === "false") filter.isValidated = false;

    const [items, total] = await Promise.all([
      TicketModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      TicketModel.countDocuments(filter)
    ]);
    return { page, limit, total, items };
  }

  async getById(id: string): Promise<TicketDocument> {
    if (!mongoose.isValidObjectId(id)) throw createHttpError(400, "id inválido");
    const doc = await TicketModel.findById(id).lean();
    if (!doc) throw createHttpError(404, "Ticket no encontrado");
    return doc as TicketDocument;
  }

  async update(id: string, patch: {
    typeId?: string;
    category?: string;
    price?: number;
    isValidated?: boolean;
    userId?: string | null;
  }): Promise<TicketDocument> {
    if (!mongoose.isValidObjectId(id)) throw createHttpError(400, "id inválido");

    const $set: any = {};
    if (patch.typeId !== undefined) {
      if (!mongoose.isValidObjectId(patch.typeId)) throw createHttpError(400, "typeId inválido");
      $set.typeId = new mongoose.Types.ObjectId(patch.typeId);
    }
    if (patch.category !== undefined) $set.category = String(patch.category).toUpperCase();
    if (patch.price !== undefined) {
      const p = Number(patch.price);
      if (!Number.isFinite(p) || p < 0) throw createHttpError(400, "price inválido");
      $set.price = p;
    }
    if (patch.isValidated !== undefined) $set.isValidated = !!patch.isValidated;

    if (patch.userId !== undefined) {
      if (patch.userId === null) $set.userId = undefined;
      else {
        if (!mongoose.isValidObjectId(patch.userId)) throw createHttpError(400, "userId inválido");
        $set.userId = new mongoose.Types.ObjectId(patch.userId);
      }
    }

    const updated = await TicketModel.findByIdAndUpdate(
      id,
      { $set, $currentDate: { updatedAt: true } },
      { new: true }
    ).lean();

    if (!updated) throw createHttpError(404, "Ticket no encontrado");
    return updated as TicketDocument;
  }

  async remove(id: string): Promise<{ ok: true }> {
    if (!mongoose.isValidObjectId(id)) throw createHttpError(400, "id inválido");
    const res = await TicketModel.findByIdAndDelete(id).lean();
    if (!res) throw createHttpError(404, "Ticket no encontrado");
    return { ok: true };
  }

  async validateByCode(ticketCode: string): Promise<TicketDocument> {
    const doc = await TicketModel.findOne({ ticketCode }).lean();
    if (!doc) throw createHttpError(404, "Ticket no encontrado");
    return doc as TicketDocument;
  }

  async useByCode(ticketCode: string): Promise<TicketDocument> {
    const updated = await TicketModel.findOneAndUpdate(
      { ticketCode, isValidated: false },
      { $set: { isValidated: true }, $currentDate: { updatedAt: true } },
      { new: true }
    ).lean();
    if (!updated) throw createHttpError(400, "Ticket inválido o ya validado");
    return updated as TicketDocument;
  }
}

export default new TicketService();
