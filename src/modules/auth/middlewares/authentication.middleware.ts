import jwt from "jsonwebtoken";
import { ApiError } from "../../../utils/errors/ApiError";
import { UserService } from "../../user/user.service";
import type { NextFunction, Request, Response } from "express";

/**
 * Extends the Express Request interface to include an optional 'user' property.
 * This allows attaching the authenticated user object to the request for downstream middleware and handlers.
 */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const userService = new UserService();

/**
 * Middleware to authenticate requests using a JSON Web Token (JWT).
 * It verifies the token from the Authorization header, finds the corresponding user,
 * and attaches the user object to the request.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The function to call to pass control to the next middleware.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Retrieves the Authorization header from the request.
  const authHeader = req.header("Authorization");

  // Checks if the Authorization header is present and correctly formatted.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError(
        401,
        "AUTH_REQUIRED",
        "No se proporcionó token de autenticación."
      )
    );
  }

  // Extracts the token from the "Bearer <token>" format.
  const token = authHeader.replace("Bearer ", "");

  try {
    // Verifies the token's signature and decodes its payload.
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Finds the user in the database using the ID from the token payload.
    const user = await userService.findUserById(decoded.id);
    if (!user) {
      return next(new ApiError(401, "AUTH_REQUIRED", "Usuario no encontrado."));
    }

    // Attaches the authenticated user object to the request.
    req.user = user;
    // Passes control to the next middleware in the stack.
    next();
  } catch (error) {
    // Handles specific JWT errors, such as an expired token.
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "AUTH_REQUIRED", "Token ha expirado."));
    }
    // Handles other potential errors during token verification as an invalid token.
    return next(new ApiError(401, "AUTH_REQUIRED", "Token inválido."));
  }
};