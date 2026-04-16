/**
 * Typed error classes used across the API. Each maps to an HTTP status code.
 * Throw these from handlers; the global exception filter formats them.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('unauthorized', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super('forbidden', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('not_found', message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('validation_failed', message, 422, details);
  }
}

export class TenantContextMissingError extends AppError {
  constructor() {
    super(
      'tenant_context_missing',
      'No tenant context on request. Refusing to query the database.',
      403,
    );
  }
}

export class AttorneyApprovalRequiredError extends AppError {
  constructor(resource: string) {
    super(
      'attorney_approval_required',
      `${resource} requires attorney approval before this action.`,
      403,
    );
  }
}
