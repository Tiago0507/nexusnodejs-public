import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../utils/errors/ApiError.js";
import type { RoleDocument } from "../../user/role.model.js";

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError(401, "AUTH_REQUIRED", "Autenticación requerida.")
      );
    }

    const userRole = (req.user.role as RoleDocument).name;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "No tienes permiso para acceder a este recurso."
        )
      );
    }

    next();
  };
};

export const hasPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new ApiError(401, "AUTH_REQUIRED", "Autenticación requerida.")
      );
    }

    const userHasPermission = await req.user.hasPermission(requiredPermission);

    if (!userHasPermission) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          `Permiso '${requiredPermission}' requerido.`
        )
      );
    }

    next();
  };
};
