import { Router } from 'express';
import { eventController } from './event.controller';
import { authenticate } from '../auth/middlewares/authentication.middleware';
import { hasPermission } from '../auth/middlewares/authorization.middleware';

/**
 * Express router for event-related endpoints.
 * Separates public routes from protected routes that require authentication and authorization.
 */
const router = Router();

// --- Public Routes ---

/**
 * GET /
 * Retrieves a list of events with optional query filters.
 * Accessible without authentication.
 */
router.get('/', eventController.getAll.bind(eventController));

/**
 * GET /:id
 * Retrieves a specific event by its identifier.
 * Accessible without authentication.
 */
router.get('/:id', eventController.getOne.bind(eventController));

// --- Protected Routes ---

/**
 * GET /organizer/:organizerId
 * Retrieves all events created by a specific organizer.
 * Requires authentication.
 */
router.get('/organizer/:organizerId', authenticate, eventController.getByOrganizer.bind(eventController));

/**
 * POST /
 * Creates a new event.
 * Requires authentication and the 'create_event' permission.
 */
router.post(
  '/',
  authenticate,
  hasPermission('create_event'),
  eventController.create.bind(eventController)
);

/**
 * PUT /:id
 * Updates an existing event by its identifier.
 * Requires authentication and the 'edit_event' permission.
 */
router.put(
  '/:id',
  authenticate,
  hasPermission('edit_event'),
  eventController.update.bind(eventController)
);

/**
 * DELETE /:id
 * Deletes an event by its identifier.
 * Requires authentication and the 'delete_event' permission.
 */
router.delete(
  '/:id',
  authenticate,
  hasPermission('delete_event'),
  eventController.remove.bind(eventController)
);

/** Exports the configured router for use in the main application. */
export default router;
