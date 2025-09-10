import createHttpError from "http-errors";

export const BadRequest = (msg: string) => createHttpError(400, msg);
export const Unauthorized = (msg = "Unauthorized") => createHttpError(401, msg);
export const Forbidden = (msg = "Forbidden") => createHttpError(403, msg);
export const NotFound = (msg: string) => createHttpError(404, msg);
export const Conflict = (msg: string) => createHttpError(409, msg);
