import type { Request, Response } from "express";

import { UserService } from "./user.service.js";
import { ApiError, BadRequestError } from "../../utils/errors/ApiError.js";
import type { UserDocument } from "./user.model.js";

class UserController {
  constructor(private userService: UserService) {}

  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.findAllUsers();
      res.status(200).json(users);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "El ID del usuario es requerido."
        );
      }
      const user = await this.userService.findUserById(id);
      res.status(200).json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;
      if (!email || typeof email !== "string") {
        throw new BadRequestError("El parámetro 'email' es requerido.");
      }
      const user = await this.userService.findUserByEmail(email);
      res.status(200).json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await this.userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as UserDocument;
      res.status(200).json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "El ID del usuario es requerido."
        );
      }
      const updatedUser = await this.userService.updateUser(id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as UserDocument).id;
      const { firstName, lastName } = req.body;
      const allowedUpdates = { firstName, lastName };

      const updatedUser = await this.userService.updateUser(
        userId,
        allowedUpdates
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "El ID del usuario es requerido."
        );
      }
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: {
          code: error.errorCode,
          message: error.message,
          details: error.details,
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
export const userController = new UserController(userService);
