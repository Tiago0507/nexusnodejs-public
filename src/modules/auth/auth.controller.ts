import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { ApiError } from "../../utils/errors/ApiError";
import type { Request, Response } from "express";
import type { RefreshTokenDto } from "./dto/token.dto";

class AuthController {
  constructor(private authService: AuthService) {}

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.authService.register(req.body);
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

  public logout(_req: Request, res: Response): void {
    res.status(204).send();
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: {
          code: error.errorCode,
          message: error.message,
        },
      });
      return;
    }
    console.error(error);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." },
    });
  }
}

const userService = new UserService();
const authService = new AuthService(userService);
export const authController = new AuthController(authService);
