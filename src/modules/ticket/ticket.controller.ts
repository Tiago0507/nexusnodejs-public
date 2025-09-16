import type { Request, Response } from "express";
import createHttpError from "http-errors";
import service from "./ticket.service";
import { assertCreateTicketDTO, sanitizeUpdateTicketDTO } from "./dto/index";

/**
 * Safely casts an unknown query value to a non-empty string.
 * Returns undefined when the value is not a string or is empty.
 *
 * @param {unknown} q - The raw query value.
 * @returns {string | undefined} A non-empty string or undefined.
 */
function qstr(q: unknown): string | undefined {
    return typeof q === "string" && q.length > 0 ? q : undefined;
}

/**
 * Narrows a query value to the literal strings "true" or "false".
 * Returns undefined for any other value.
 *
 * @param {unknown} q - The raw query value.
 * @returns {"true" | "false" | undefined} The normalized boolean string or undefined.
 */
function qboolStr(q: unknown): "true" | "false" | undefined {
    if (q === "true") return "true";
    if (q === "false") return "false";
    return undefined;
}

/**
 * Ensures a required route parameter exists and is a non-empty string.
 * Throws an HTTP 400 error when the parameter is missing or invalid.
 *
 * @param {Request["params"]} params - The Express params bag.
 * @param {string} key - The expected parameter key.
 * @returns {string} The validated parameter value.
 * @throws {HttpError} If the parameter is missing or invalid.
 */
function mustParam(params: Request["params"], key: string): string {
    const v = (params as Record<string, unknown>)[key];
    if (typeof v !== "string" || v.length === 0) {
        throw createHttpError(400, `Parámetro requerido: ${key}`);
    }
    return v;
}

/**
 * Controller responsible for ticket-related endpoints.
 * It validates inputs, delegates business logic to the service layer,
 * and maps domain errors to appropriate HTTP responses.
 */
export class TicketController {
    // CREATE
    /**
     * Creates a new ticket document.
     * Validates the request body against CreateTicketDTO and delegates to the service.
     *
     * @param {Request} req - Express request containing the ticket payload.
     * @param {Response} res - Express response used to return the created document.
     * @returns {Promise<void>} Sends status 201 with the created ticket.
     */
    async create(req: Request, res: Response) {
        try {
            // Validates the incoming payload; throws on invalid shape or values.
            assertCreateTicketDTO(req.body);
            // Delegates ticket creation to the service layer.
            const doc = await service.createOne(req.body);
            // Responds with HTTP 201 and the created ticket document.
            res.status(201).json(doc);
        } catch (err: any) {
            // Normalizes any error to an HttpError with a 400 status by default.
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, err?.message || "Error creando ticket");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // READ list
    /**
     * Lists tickets with optional filtering and pagination.
     * Supports filtering by eventId, userId, and isValidated.
     *
     * @param {Request} req - Express request containing query parameters.
     * @param {Response} res - Express response used to return the listing result.
     * @returns {Promise<void>} Sends a JSON payload with paginated data.
     */
    async list(req: Request, res: Response) {
        try {
            // Parses pagination parameters with sensible defaults.
            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 10);

            // Builds a typed options object, excluding undefined fields.
            const opts: {
                page: number;
                limit: number;
                eventId?: string;
                userId?: string;
                isValidated?: "true" | "false";
            } = { page, limit };

            // Optionally includes eventId if provided as a non-empty string.
            const eventId = qstr(req.query.eventId);
            if (eventId) opts.eventId = eventId;

            // Optionally includes userId if provided as a non-empty string.
            const userId = qstr(req.query.userId);
            if (userId) opts.userId = userId;

            // Optionally includes isValidated if provided as "true" or "false".
            const isValidated = qboolStr(req.query.isValidated);
            if (isValidated) opts.isValidated = isValidated;

            // Delegates the listing operation to the service.
            const data = await service.list(opts);
            res.json(data);
        } catch (err: any) {
            // Normalizes unexpected errors to a generic 400 listing error.
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, "Error listando tickets");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // READ by id
    /**
     * Retrieves a ticket by its identifier.
     *
     * @param {Request} req - Express request containing the `id` route parameter.
     * @param {Response} res - Express response used to return the ticket document.
     * @returns {Promise<void>} Sends the ticket document as JSON or a 404 error.
     */
    async getById(req: Request, res: Response) {
        try {
            // Validates and extracts the required `id` parameter.
            const id = mustParam(req.params, "id");
            // Delegates fetching to the service layer.
            const doc = await service.getById(id);
            res.json(doc);
        } catch (err: any) {
            // Returns 404 when the ticket is not found or maps other errors accordingly.
            const e = createHttpError.isHttpError(err) ? err : createHttpError(404, "Ticket no encontrado");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // UPDATE
    /**
     * Applies a partial update to a ticket.
     * Sanitizes the input payload into a valid UpdateTicketDTO before delegating.
     *
     * @param {Request} req - Express request containing `id` and a partial payload.
     * @param {Response} res - Express response used to return the updated document.
     * @returns {Promise<void>} Sends the updated ticket document as JSON.
     */
    async update(req: Request, res: Response) {
        try {
            // Validates and extracts the required `id` parameter.
            const id = mustParam(req.params, "id");
            // Sanitizes the input into a DTO with only whitelisted fields.
            const patch = sanitizeUpdateTicketDTO(req.body);
            // Delegates update logic to the service layer.
            const doc = await service.update(id, patch);
            res.json(doc);
        } catch (err: any) {
            // Returns 400 for validation issues or maps to existing HttpError instances.
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, err?.message || "Error actualizando ticket");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // DELETE
    /**
     * Deletes a ticket by its identifier.
     *
     * @param {Request} req - Express request containing the `id` route parameter.
     * @param {Response} res - Express response used to return the deletion result.
     * @returns {Promise<void>} Sends a JSON result indicating success or failure.
     */
    async remove(req: Request, res: Response) {
        try {
            // Validates and extracts the required `id` parameter.
            const id = mustParam(req.params, "id");
            // Delegates deletion to the service layer.
            const ok = await service.remove(id);
            res.json(ok);
        } catch (err: any) {
            // Returns 400 on failure to delete or maps to existing HttpError instances.
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, "Error eliminando ticket");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    // UTILIDADES
    /**
     * Validates a ticket by its public ticket code without mutating state.
     *
     * @param {Request} req - Express request containing the `ticketCode` parameter.
     * @param {Response} res - Express response used to return the ticket status.
     * @returns {Promise<void>} Sends `{ ok: true, ticket }` when found.
     */
    async validateByCode(req: Request, res: Response) {
        try {
            // Ensures the `ticketCode` parameter is present and valid.
            const ticketCode = mustParam(req.params, "ticketCode");
            // Delegates non-mutating validation to the service layer.
            const ticket = await service.validateByCode(ticketCode);
            res.json({ ok: true, ticket });
        } catch (err: any) {
            // Returns 404 when the ticket does not exist or cannot be validated.
            const e = createHttpError.isHttpError(err) ? err : createHttpError(404, "Ticket no encontrado");
            res.status(e.statusCode).json({ message: e.message });
        }
    }

    /**
     * Marks a ticket as used by its public ticket code.
     * This operation mutates the ticket state to reflect usage/validation.
     *
     * @param {Request} req - Express request containing the `ticketCode` parameter.
     * @param {Response} res - Express response used to return the updated ticket.
     * @returns {Promise<void>} Sends `{ ok: true, ticket }` on success.
     */
    async useByCode(req: Request, res: Response) {
        try {
            // Ensures the `ticketCode` parameter is present and valid.
            const ticketCode = mustParam(req.params, "ticketCode");
            // Delegates state mutation to the service layer.
            const ticket = await service.useByCode(ticketCode);
            res.json({ ok: true, ticket });
        } catch (err: any) {
            // Returns 400 when the ticket is invalid or already used, or maps to HttpError.
            const e = createHttpError.isHttpError(err) ? err : createHttpError(400, "Ticket inválido o ya validado");
            res.status(e.statusCode).json({ message: e.message });
        }
    }
}

/**
 * Exports a singleton controller instance for routing integration.
 */
export default new TicketController();
