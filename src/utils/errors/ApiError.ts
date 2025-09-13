export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly details: any[];

  constructor(
    statusCode: number,
    errorCode: ErrorCode,
    message: string,
    details: any[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details: any[] = []) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, "CONFLICT", message);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = "Ocurrió un error interno en el servidor.") {
    super(500, "INTERNAL_ERROR", message);
  }
}
