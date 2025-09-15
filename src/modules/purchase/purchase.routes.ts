import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { authenticate } from '../auth/middlewares/authentication.middleware';
import { hasPermission } from '../auth/middlewares/authorization.middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  hasPermission('buy_ticket'),
  purchaseController.create.bind(purchaseController)
);

export default router;