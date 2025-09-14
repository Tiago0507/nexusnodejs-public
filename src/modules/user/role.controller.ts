import type { Request, Response } from "express";
import { RoleService } from "./role.service.js";
import { ApiError, BadRequestError } from "../../utils/errors/ApiError.js";

class RoleController {
  constructor(private roleService: RoleService) {}

  public async getAllRoles(_req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.roleService.findAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      this.handleError(error, res);
    }
  }

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

  public async createRole(req: Request, res: Response): Promise<void> {
    try {
      const newRole = await this.roleService.createRole(req.body);
      res.status(201).json(newRole);
    } catch (error) {
      this.handleError(error, res);
    }
  }

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

  public async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError("El ID del rol es requerido.");
      }
      await this.roleService.deleteRole(id);
      res.status(204).send();
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

export const roleController = new RoleController(new RoleService());
