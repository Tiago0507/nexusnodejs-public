import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { BadRequest } from "../utils/errors.js";

export function validate(schema: ZodSchema<any>) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
            throw BadRequest(msg);
        }
        // Si quieres mutar el body con tipos validados: req.body = parsed.data;
        next();
    };
}
