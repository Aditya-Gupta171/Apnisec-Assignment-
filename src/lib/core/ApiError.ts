export interface ErrorDetails {
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: ErrorDetails;

  constructor(statusCode: number, message: string, details?: ErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Validation failed", details?: ErrorDetails) {
    super(400, message, details);
  }
}

export class AuthError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "Too many requests") {
    super(429, message);
  }
}
