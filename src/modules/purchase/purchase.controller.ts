import type { Request, Response } from 'express';
import { purchaseService } from './purchase.service';
import { ApiError } from '../../utils/errors/ApiError';
import type { UserDocument } from '../user/user.model';

/**
 * Controller class responsible for handling purchase-related requests.
 * It delegates business logic to the purchaseService and manages error handling.
 */
class PurchaseController {
  /**
   * Handles the creation of a new purchase.
   * 
   * @param {Request} req - The Express request object, expected to contain the purchase data in the body
   * and the authenticated user in `req.user`.
   * @param {Response} res - The Express response object used to send the result back to the client.
   * @returns {Promise<void>} Resolves with no value, sends JSON response with purchase result.
   */
  public async create(req: Request, res: Response): Promise<void> {
    try {
      // Extracts the authenticated user object from the request and casts it to UserDocument.
      const buyer = req.user as UserDocument;

      // Delegates creation logic to the purchaseService, passing request body and buyer information.
      const result = await purchaseService.createPurchase(req.body, buyer);

      // Sends a success response with HTTP 201 status code and the created purchase as JSON.
      res.status(201).json(result);
    } catch (error) {
      // Handles errors using the private method handleError.
      this.handleError(error, res);
    }
  }

  /**
   * Centralized error handler for purchase controller operations.
   * Differentiates between known ApiError instances and unexpected errors.
   *
   * @param {unknown} error - The caught error from a controller method.
   * @param {Response} res - The Express response object used to send the error back to the client.
   */
  private handleError(error: unknown, res: Response): void {
    // Handles expected errors wrapped in ApiError with appropriate status and structured JSON response.
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: { code: error.errorCode, message: error.message },
      });
      return;
    }

    // Logs unexpected errors to the server console for debugging purposes.
    console.error(error);

    // Sends a generic internal server error response for unhandled exceptions.
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." },
    });
  }
}

/**
 * Singleton instance of the PurchaseController to be used across routes.
 */
export const purchaseController = new PurchaseController();
