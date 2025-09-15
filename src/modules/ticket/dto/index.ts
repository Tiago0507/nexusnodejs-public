export interface CreateTicketDTO {
  eventId: string;
  typeId: string;
  category: string;
  price: number;
  userId?: string;

  // opcionales: si vienen, se respetan
  ticketCode?: string;
  qrCodeHash?: string;
}

export interface UpdateTicketDTO {
  typeId?: string;
  category?: string;
  price?: number;
  isValidated?: boolean;
  userId?: string | null;
}

export function assertCreateTicketDTO(body: any): asserts body is CreateTicketDTO {
  if (!body || typeof body !== "object") throw new Error("Payload inválido");
  if (!body.eventId || typeof body.eventId !== "string") throw new Error("eventId requerido");
  if (!body.typeId || typeof body.typeId !== "string") throw new Error("typeId requerido");
  if (!body.category || typeof body.category !== "string") throw new Error("category requerido");
  const p = Number(body.price);
  if (!Number.isFinite(p) || p < 0) throw new Error("price inválido");
}

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
