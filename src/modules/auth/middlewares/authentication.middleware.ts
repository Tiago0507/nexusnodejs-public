import jwt from "jsonwebtoken";
import { ApiError } from "../../../utils/errors/ApiError.js";
import { UserService } from "../../user/user.service.js";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const userService = new UserService();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError(
        401,
        "AUTH_REQUIRED",
        "No se proporcionó token de autenticación."
      )
    );
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await userService.findUserById(decoded.id);
    if (!user) {
      return next(new ApiError(401, "AUTH_REQUIRED", "Usuario no encontrado."));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, "AUTH_REQUIRED", "Token ha expirado."));
    }
    return next(new ApiError(401, "AUTH_REQUIRED", "Token inválido."));
  }
};
