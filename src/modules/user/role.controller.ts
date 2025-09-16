import type { Request, Response } from "express";
import { RoleService } from "./role.service";
import { ApiError, BadRequestError } from "../../utils/errors/ApiError";

/**
 * Controller for handling Role-related HTTP requests.
 * It manages CRUD (Create, Read, Update, Delete) operations for roles.
 */
class RoleController {
  /**
   * Initializes a new instance of the RoleController.
   * @param {RoleService} roleService - The service responsible for role business logic.
   */
  constructor(private roleService: RoleService) {}

  /**
   * Retrieves all roles.
   * @param {Request} _req - The Express request object (unused).
   * @param {Response} res - The Express response object.
   */
  public async getAllRoles(_req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.roleService.findAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Retrieves a single role by its ID.
   * @param {Request} req - The Express request object, containing the role ID in params.
   * @param {Response} res - The Express response object.
   */
  public async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError("El ID del rol es requerido.");
      }
      const role = await this.roleService.findRoleById(id);
      res.status(200).json(role);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Creates a new role.
   * @param {Request} req - The Express request object, containing the new role data in the body.
   * @param {Response} res - The Express response object.
   */
  public async createRole(req: Request, res: Response): Promise<void> {
    try {
      const newRole = await this.roleService.createRole(req.body);
      res.status(201).json(newRole);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Updates an existing role.
   * @param {Request} req - The Express request object, containing the role ID and update data.
   * @param {Response} res - The Express response object.
   */
  public async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError("El ID del rol es requerido.");
      }
      const updatedRole = await this.roleService.updateRole(id, req.body);
      res.status(200).json(updatedRole);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Deletes a role by its ID.
   * @param {Request} req - The Express request object, containing the role ID in params.
   * @param {Response} res - The Express response object.
   */
  public async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError("El ID del rol es requerido.");
      }
      await this.roleService.deleteRole(id);
      // Sends a 204 No Content response upon successful deletion.
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Centralized error handler for the controller.
   * Formats and sends an appropriate error response based on the error type.
   * @param {unknown} error - The caught error object.
   * @param {Response} res - The Express response object.
   */
  private handleError(error: unknown, res: Response): void {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        error: { code: error.errorCode, message: error.message },
      });
      return;
    }
    // Logs any unexpected errors to the console.
    console.error(error);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." },
    });
  }
}

// Creates and exports a single instance of the RoleController with its dependency.
export const roleController = new RoleController(new RoleService());