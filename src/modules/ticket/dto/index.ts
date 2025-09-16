/**
 * Data Transfer Object (DTO) used when creating a ticket.
 * Encapsulates all fields required by the API to persist a new ticket.
 */
export interface CreateTicketDTO {
  /** Identifier of the related event. */
  eventId: string;
  /** Identifier of the ticket type (e.g., reference to a pricing tier). */
  typeId: string;
  /** Human-readable category or label for the ticket. */
  category: string;
  /** Monetary price assigned to the ticket (non-negative). */
  price: number;
  /** Optional identifier of the user who owns the ticket at creation time. */
  userId?: string;

  // opcionales: si vienen, se respetan
  /** Optional explicit ticket code; if omitted, the system may generate one. */
  ticketCode?: string;
  /** Optional QR code hash; if omitted, the system may generate one. */
  qrCodeHash?: string;
}

/**
 * DTO used for partial ticket updates.
 * All properties are optional to enable granular PATCH-like behavior.
 */
export interface UpdateTicketDTO {
  /** Optional update for the ticket type identifier. */
  typeId?: string;
  /** Optional update for the category label. */
  category?: string;
  /** Optional update for the monetary price (non-negative). */
  price?: number;
  /** Optional update for validation status. */
  isValidated?: boolean;
  /** Optional reassignment of user ownership; accepts null to clear ownership. */
  userId?: string | null;
}

/**
 * Runtime validator for CreateTicketDTO.
 * It asserts that the provided payload conforms to CreateTicketDTO requirements.
 * Throws an Error with a descriptive message on invalid input.
 *
 * @param {any} body - The incoming payload to validate.
 * @throws {Error} If the payload is missing or any required field is invalid.
 * @remarks
 * - Ensures eventId, typeId, and category are non-empty strings.
 * - Ensures price is a finite, non-negative number.
 */
export function assertCreateTicketDTO(body: any): asserts body is CreateTicketDTO {
  if (!body || typeof body !== "object") throw new Error("Payload inválido");
  if (!body.eventId || typeof body.eventId !== "string") throw new Error("eventId requerido");
  if (!body.typeId || typeof body.typeId !== "string") throw new Error("typeId requerido");
  if (!body.category || typeof body.category !== "string") throw new Error("category requerido");
  const p = Number(body.price);
  if (!Number.isFinite(p) || p < 0) throw new Error("price inválido");
}

/**
 * Sanitizes and narrows a generic payload into a valid UpdateTicketDTO.
 * Only whitelisted properties are copied if they pass basic type checks.
 * Invalid numeric inputs for price cause an Error to be thrown.
 *
 * @param {any} body - The incoming partial payload.
 * @returns {UpdateTicketDTO} A sanitized object containing only valid updates.
 * @throws {Error} If provided price is not finite or is negative.
 * @remarks
 * - Ignores unknown fields.
 * - Accepts `userId: null` to explicitly remove user ownership.
 */
export function sanitizeUpdateTicketDTO(body: any): UpdateTicketDTO {
  const out: UpdateTicketDTO = {};
  if (!body || typeof body !== "object") return out;

  if (typeof body.typeId === "string") out.typeId = body.typeId;
  if (typeof body.category === "string") out.category = body.category;
  if (body.price !== undefined) {
    const p = Number(body.price);
    if (!Number.isFinite(p) || p < 0) throw new Error("price inválido");
    out.price = p;
  }
  if (typeof body.isValidated === "boolean") out.isValidated = body.isValidated;

  if (body.userId === null) out.userId = null;
  else if (typeof body.userId === "string") out.userId = body.userId;

  return out;
}
