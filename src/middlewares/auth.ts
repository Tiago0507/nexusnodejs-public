import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Unauthorized } from "../utils/errors.js";
import { ENV, normalizeRole } from "../config/env.js";

export function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) throw Unauthorized("Missing token");
  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as { sub: string; role?: string };
    req.user = { id: payload.sub, role: normalizeRole(payload.role) as any };
    next();
  } catch {
    throw Unauthorized("Invalid token");
  }
}
