import crypto from "crypto";
import mongoose from "mongoose";
import createHttpError from "http-errors";
import TicketModel, { type TicketDocument } from "./ticket.model";

/**
 * Generates a random ticket code.
 * Uses 4 cryptographically secure random bytes encoded as hex.
 * @returns {string} Lowercase 8-character hexadecimal string.
 */
function genCode(): string {
  return crypto.randomBytes(4).toString("hex");
}

/**
 * Generates a QR code hash value.
 * Hashes a freshly generated UUID with SHA-256 for uniqueness and integrity.
 * @returns {string} Hex-encoded SHA-256 hash string.
 */
function genQrHash(): string {
  return crypto.createHash("sha256").update(crypto.randomUUID()).digest("hex");
}

/**
 * Options for listing tickets with pagination and filters.
 */
export interface ListOpts {
  /** 1-based page number, defaults to 1 when not provided or invalid. */
  page?: number;
  /** Page size, defaults to 10 and caps at 100. */
  limit?: number;
  /** Optional filter by event identifier (ObjectId as string). */
  eventId?: string;
  /** Optional filter by user identifier (ObjectId as string). */
  userId?: string;
  /** Optional filter by validation state as a string literal. */
  isValidated?: "true" | "false";
}

/**
 * Service encapsulating ticket-related business operations.
 * It validates inputs, constructs query filters, and interacts with the persistence layer (Mongoose).
 */
export class TicketService {
  /**
   * Creates a single ticket document.
   * Generates `ticketCode` and `qrCodeHash` when not provided and normalizes identifiers to ObjectId.
   *
   * @param payload - Ticket fields required for creation.
   * @returns {Promise<TicketDocument>} The persisted ticket document as a plain object.
   * @throws {HttpError} On validation or persistence errors.
   */
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

  /**
   * Retrieves a paginated list of tickets with optional filters.
   * Validates and converts string ObjectIds, and maps isValidated from string literals to booleans.
   *
   * @param opts - Pagination and filter options.
   * @returns Paginated response containing items and total count.
   * @throws {HttpError} When provided identifiers are not valid ObjectIds.
   */
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

  /**
   * Retrieves a ticket by its identifier.
   *
   * @param id - Ticket ObjectId as a string.
   * @returns {Promise<TicketDocument>} The found ticket document as a plain object.
   * @throws {HttpError} 400 on invalid id, 404 when not found.
   */
  async getById(id: string): Promise<TicketDocument> {
    if (!mongoose.isValidObjectId(id)) throw createHttpError(400, "id inválido");
    const doc = await TicketModel.findById(id).lean();
    if (!doc) throw createHttpError(404, "Ticket no encontrado");
    return doc as TicketDocument;
  }

  /**
   * Applies a partial update to a ticket.
   * Normalizes and validates fields, converts identifiers to ObjectId, and updates timestamps.
   *
   * @param id - Ticket ObjectId as a string.
   * @param patch - Partial set of updatable fields.
   * @returns {Promise<TicketDocument>} The updated ticket document as a plain object.
   * @throws {HttpError} 400 on invalid inputs, 404 when the ticket does not exist.
   */
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

  /**
   * Deletes a ticket by its identifier.
   *
   * @param id - Ticket ObjectId as a string.
   * @returns {{ ok: true }} Confirmation object on successful deletion.
   * @throws {HttpError} 400 on invalid id, 404 when nothing is deleted.
   */
  async remove(id: string): Promise<{ ok: true }> {
    if (!mongoose.isValidObjectId(id)) throw createHttpError(400, "id inválido");
    const res = await TicketModel.findByIdAndDelete(id).lean();
    if (!res) throw createHttpError(404, "Ticket no encontrado");
    return { ok: true };
  }

  /**
   * Retrieves a ticket by its public ticket code without mutation.
   *
   * @param ticketCode - Public ticket code.
   * @returns {Promise<TicketDocument>} The ticket document when found.
   * @throws {HttpError} 404 when the ticket does not exist.
   */
  async validateByCode(ticketCode: string): Promise<TicketDocument> {
    const doc = await TicketModel.findOne({ ticketCode }).lean();
    if (!doc) throw createHttpError(404, "Ticket no encontrado");
    return doc as TicketDocument;
  }

  /**
   * Marks a ticket as used by its public ticket code.
   * Updates the `isValidated` flag and `updatedAt` timestamp.
   *
   * @param ticketCode - Public ticket code.
   * @returns {Promise<TicketDocument>} The updated ticket document.
   * @throws {HttpError} 400 when the ticket is invalid or already validated.
   */
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

/**
 * Exports a singleton instance of the TicketService for reuse across the application.
 */
export default new TicketService();
