import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { authenticate } from '../auth/middlewares/authentication.middleware';
import { hasPermission } from '../auth/middlewares/authorization.middleware';

/**
 * Express router for handling purchase-related routes.
 * Applies authentication and authorization middleware to secure endpoints.
 */
const router = Router();

/**
 * POST / 
 * Creates a new purchase.
 * 
 * Middleware sequence:
 * 1. authenticate - Ensures the request includes a valid JWT and attaches the user to the request.
 * 2. hasPermission('buy_ticket') - Verifies that the authenticated user has the required permission.
 * 3. purchaseController.create - Handles the business logic of creating a purchase.
 */
router.post(
  '/',
  authenticate,
  hasPermission('buy_ticket'),
  purchaseController.create.bind(purchaseController)
);

/**
 * Exports the configured router to be mounted in the application.
 */
export default router;
