import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../../utils/errors/ApiError";
import type { RoleDocument } from "../../user/role.model";

/**
 * Creates a middleware function for role-based authorization.
 * This function checks if the authenticated user's role is included in the list of allowed roles.
 *
 * @param {string[]} allowedRoles - An array of role names that are permitted to access the route.
 * @returns An Express middleware function that performs the authorization check.
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensures that a user object is attached to the request, which implies prior authentication.
    if (!req.user) {
      return next(
        new ApiError(401, "AUTH_REQUIRED", "Autenticación requerida.")
      );
    }

    // Retrieves the name of the user's role.
    const userRole = (req.user.role as RoleDocument).name;

    // Checks if the user's role is present in the list of allowed roles.
    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "No tienes permiso para acceder a este recurso."
        )
      );
    }

    // If authorization is successful, passes control to the next middleware.
    next();
  };
};

/**
 * Creates a middleware function for permission-based authorization.
 * This function checks if the authenticated user has a specific required permission.
 *
 * @param {string} requiredPermission - The name of the permission required to access the route.
 * @returns An Express middleware function that performs the permission check.
 */
export const hasPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ensures that a user object is attached to the request.
    if (!req.user) {
      return next(
        new ApiError(401, "AUTH_REQUIRED", "Autenticación requerida.")
      );
    }

    // Asynchronously checks if the user's role includes the required permission.
    const userHasPermission = await req.user.hasPermission(requiredPermission);

    // If the user does not have the permission, denies access.
    if (!userHasPermission) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          `Permiso '${requiredPermission}' requerido.`
        )
      );
    }

    // If the user has the required permission, passes control to the next middleware.
    next();
  };
};