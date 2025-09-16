import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { ApiError } from "../../utils/errors/ApiError";
import type { Request, Response } from "express";
import type { RefreshTokenDto } from "./dto/token.dto";

/**
 * Controller to handle authentication-related requests.
 * Manages user registration, login, token refresh, and logout processes.
 */
class AuthController {
  /**
   * Initializes a new instance of the AuthController.
   * @param {AuthService} authService - The service responsible for authentication logic.
   */
  constructor(private authService: AuthService) {}

  /**
   * Handles user registration.
   * Creates a new user based on the request body.
   * @param {Request} req - The Express request object, containing user data in the body.
   * @param {Response} res - The Express response object.
   */
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.authService.register(req.body);
      // Maps the created user to a safe response object.
      const userResponse = {
        id: user.id,
        email: user.email,
        role: (user.role as any).name,
      };
      res.status(201).json({ user: userResponse });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handles user login.
   * Authenticates the user and returns access and refresh tokens.
   * @param {Request} req - The Express request object, containing credentials in the body.
   * @param {Response} res - The Express response object.
   */
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken, refreshToken } = await this.authService.login(
        req.body
      );
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Refreshes an access token using a refresh token.
   * @param {Request} req - The Express request object, containing the refresh token in the body.
   * @param {Response} res - The Express response object.
   */
  public async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenDto;
      if (!refreshToken) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Refresh token es requerido."
        );
      }
      const { accessToken } = this.authService.refresh(refreshToken);
      res.status(200).json({ accessToken });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handles user logout.
   * In a stateless JWT implementation, this typically involves clearing tokens on the client-side.
   * This endpoint provides a conventional way to signify logout and returns a no-content response.
   * @param {Request} _req - The Express request object (unused).
   * @param {Response} res - The Express response object.
   */
  public logout(_req: Request, res: Response): void {
    // A 204 No Content response is standard for successful actions that don't return data.
    res.status(204).send();
  }

  /**
   * Centralized error handler for the controller.
   * It formats and sends an appropriate error response based on the error type.
   * @param {unknown} error - The error object caught.
   * @param {Response} res - The Express response object.
   */
  private handleError(error: unknown, res: Response): void {
    // Handles custom, known API errors.
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: {
          code: error.errorCode,
          message: error.message,
        },
      });
      return;
    }
    // Handles unexpected, unknown errors.
    console.error(error);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." },
    });
  }
}

// Instantiates the services required by the controller.
const userService = new UserService();
const authService = new AuthService(userService);
// Creates and exports a single instance of the controller.
export const authController = new AuthController(authService);