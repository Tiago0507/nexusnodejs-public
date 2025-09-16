import type { Request, Response } from "express";

import { UserService } from "./user.service";
import { ApiError, BadRequestError } from "../../utils/errors/ApiError";
import type { UserDocument } from "./user.model";

/**
 * Controller for handling User-related HTTP requests.
 * Manages CRUD operations and other user-specific actions.
 */
class UserController {
  /**
   * Initializes a new instance of the UserController.
   * @param {UserService} userService - The service responsible for user business logic.
   */
  constructor(private userService: UserService) {}

  /**
   * Retrieves all users.
   * @param {Request} _req - The Express request object (unused).
   * @param {Response} res - The Express response object.
   */
  public async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.findAllUsers();
      res.status(200).json(users);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Retrieves a single user by their ID from the request parameters.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
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

  /**
   * Retrieves a single user by their email from the query string.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
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

  /**
   * Creates a new user.
   * @param {Request} req - The Express request object, containing new user data in the body.
   * @param {Response} res - The Express response object.
   */
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await this.userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   * Relies on authentication middleware to attach the user object to the request.
   * @param {Request} req - The Express request object, containing the authenticated user.
   * @param {Response} res - The Express response object.
   */
  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as UserDocument;
      res.status(200).json(user);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Updates a user by their ID. Typically an admin-only action.
   * @param {Request} req - The Express request object, containing the user ID and update data.
   * @param {Response} res - The Express response object.
   */
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

  /**
   * Updates the profile of the currently authenticated user.
   * Restricts updates to a limited set of fields for security.
   * @param {Request} req - The Express request object, containing the authenticated user and update data.
   * @param {Response} res - The Express response object.
   */
  public async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as UserDocument).id;
      // Explicitly selects which fields can be updated by a user on their own profile.
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

  /**
   * Deletes a user by their ID.
   * @param {Request} req - The Express request object, containing the user ID in params.
   * @param {Response} res - The Express response object.
   */
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

  /**
   * Centralized error handler for the controller.
   * @param {unknown} error - The caught error object.
   * @param {Response} res - The Express response object.
   */
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

// Instantiates the UserService.
const userService = new UserService();
// Creates and exports a single instance of the UserController with its dependency.
export const userController = new UserController(userService);