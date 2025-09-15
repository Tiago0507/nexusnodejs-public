import type { Request, Response } from 'express';
import { purchaseService } from './purchase.service';
import { ApiError } from '../../utils/errors/ApiError';
import type { UserDocument } from '../user/user.model';

class PurchaseController {
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const buyer = req.user as UserDocument;
      const result = await purchaseService.createPurchase(req.body, buyer);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  }
  
  private handleError(error: unknown, res: Response): void {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: { code: error.errorCode, message: error.message },
      });
      return;
    }
    console.error(error);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." },
    });
  }
}

export const purchaseController = new PurchaseController();