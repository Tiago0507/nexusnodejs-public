import { Router } from 'express';
import { eventController } from './event.controller';
import { authenticate } from '../auth/middlewares/authentication.middleware';
import { hasPermission } from '../auth/middlewares/authorization.middleware';

const router = Router();

// --- Public Routes ---
router.get('/', eventController.getAll.bind(eventController));
router.get('/:id', eventController.getOne.bind(eventController));

// --- Protected Routes ---
router.get('/organizer/:organizerId', authenticate, eventController.getByOrganizer.bind(eventController));

// The 'create_event' permission is required.
router.post(
  '/',
  authenticate,
  hasPermission('create_event'),
  eventController.create.bind(eventController)
);

// The 'edit_event' permission is required.
router.put(
  '/:id',
  authenticate,
  hasPermission('edit_event'),
  eventController.update.bind(eventController)
);

// The 'delete_event' permission is required.
router.delete(
  '/:id',
  authenticate,
  hasPermission('delete_event'),
  eventController.remove.bind(eventController)
);

export default router;