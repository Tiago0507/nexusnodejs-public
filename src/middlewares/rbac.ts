import type { Request, Response, NextFunction } from "express";
import { Forbidden } from "../utils/errors.js";
import { normalizeRole, type AppRole } from "../config/env.js";

/**
 * rbac(["organizer","superadmin"])
 * rbac(["superadmin"]) para listados globales o deletes
 */
export function rbac(allowed: AppRole[]) {
  const normalizedAllowed = allowed.map((r) => normalizeRole(r));
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = normalizeRole(req.user?.role as string | undefined);
    if (!normalizedAllowed.includes(role)) throw Forbidden();
    next();
  };
}
