import { Router } from "express";
import controller from "./ticket.controller";

/**
 * Express router for ticket-related operations.
 * Defines RESTful endpoints for CRUD actions and extra utility routes.
 */
const router = Router();
const BASE = "/tickets";

// CRUD
/**
 * POST /tickets
 * Creates a new ticket document.
 */
router.post(`${BASE}`, controller.create);

/**
 * GET /tickets
 * Retrieves a paginated list of tickets, with optional filters.
 */
router.get(`${BASE}`, controller.list);

/**
 * GET /tickets/:id
 * Retrieves a single ticket by its unique identifier.
 */
router.get(`${BASE}/:id`, controller.getById);

/**
 * PUT /tickets/:id
 * Updates a ticket with the provided partial payload.
 */
router.put(`${BASE}/:id`, controller.update);

/**
 * DELETE /tickets/:id
 * Removes a ticket from the database by its unique identifier.
 */
router.delete(`${BASE}/:id`, controller.remove);

// Extra
/**
 * GET /tickets/validate/:ticketCode
 * Validates a ticket by its public ticket code without mutating state.
 */
router.get(`${BASE}/validate/:ticketCode`, controller.validateByCode);

/**
 * POST /tickets/use/:ticketCode
 * Marks a ticket as used by its public ticket code.
 */
router.post(`${BASE}/use/:ticketCode`, controller.useByCode);

/**
 * Exports the configured router to be mounted in the main application.
 */
export default router;
