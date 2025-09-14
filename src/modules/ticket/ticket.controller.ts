import type { Request, Response } from "express";
import createHttpError from "http-errors";
import service from "./ticket.service.js";
import { assertCreateTicketDTO, sanitizeUpdateTicketDTO } from "./dto/index.js";

function qstr(q: unknown): string | undefined {
    return typeof q === "string" && q.length > 0 ? q : undefined;
}
function qboolStr(q: unknown): "true" | "false" | undefined {
    if (q === "true") return "true";
    if (q === "false") return "false";
    return undefined;
}
function mustParam(params: Request["params"], key: string): string {
    const v = (params as Record<string, unknown>)[key];
    if (typeof v !== "string" || v.length === 0) {
        throw createHttpError(400, `Parámetro requerido: ${key}`);
    }
    return v;
}

export class TicketController {
    // CREATE
    async create(req: Request, res: Response) {
        try {
            assertCreateTicketDTO(req.body);
            const doc = await service.createOne(req.body);
            res.status(201).json(doc);
        } catch (err: any) {
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, err?.message || "Error creando ticket");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // READ list
    async list(req: Request, res: Response) {
        try {
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 10);

            // Construir el objeto sin incluir propiedades undefined
            const opts: {
                page: number;
                limit: number;
                eventId?: string;
                userId?: string;
                isValidated?: "true" | "false";
            } = { page, limit };

            const eventId = qstr(req.query.eventId);
            if (eventId) opts.eventId = eventId;

            const userId = qstr(req.query.userId);
            if (userId) opts.userId = userId;

            const isValidated = qboolStr(req.query.isValidated);
            if (isValidated) opts.isValidated = isValidated;

            const data = await service.list(opts);
            res.json(data);
        } catch (err: any) {
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, "Error listando tickets");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // READ by id
    async getById(req: Request, res: Response) {
        try {
            const id = mustParam(req.params, "id");
            const doc = await service.getById(id);
            res.json(doc);
        } catch (err: any) {
            const e = createHttpError.isHttpError(err) ? err : createHttpError(404, "Ticket no encontrado");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // UPDATE
    async update(req: Request, res: Response) {
        try {
            const id = mustParam(req.params, "id");
            const patch = sanitizeUpdateTicketDTO(req.body);
            const doc = await service.update(id, patch);
            res.json(doc);
        } catch (err: any) {
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, err?.message || "Error actualizando ticket");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // DELETE
    async remove(req: Request, res: Response) {
        try {
            const id = mustParam(req.params, "id");
            const ok = await service.remove(id);
            res.json(ok);
        } catch (err: any) {
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, "Error eliminando ticket");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // UTILIDADES
    async validateByCode(req: Request, res: Response) {
        try {
            const ticketCode = mustParam(req.params, "ticketCode");
            const ticket = await service.validateByCode(ticketCode);
            res.json({ ok: true, ticket });
        } catch (err: any) {
            const e = createHttpError.isHttpError(err) ? err : createHttpError(404, "Ticket no encontrado");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    async useByCode(req: Request, res: Response) {
        try {
            const ticketCode = mustParam(req.params, "ticketCode");
            const ticket = await service.useByCode(ticketCode);
            res.json({ ok: true, ticket });
        } catch (err: any) {
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, "Ticket inválido o ya validado");
            res.status(e.statusCode).json({ message: e.message });
        }
    }
}

export default new TicketController();
