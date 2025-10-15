import { validationResult, ValidationError } from 'express-validator';
type FieldError = {
  type: 'field';
  path: string;
  msg: string;
};
/**
 * Custom application error class that extends the native Error
 */
export class AppError extends Error {
  public statusCode: number;
  public errorDetails?: any;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, errorDetails?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    this.isOperational = true; // Indicates if it's an operational error (expected in business flow)

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for unauthorized access
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access.', errorDetails?: any) {
    super(message, 401, errorDetails);
  }
}

/**
 * Error for forbidden access (authentication successful but not authorized)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access.', errorDetails?: any) {
    super(message, 403, errorDetails);
  }
}

/**
 * Error for validation failures
 */
export class ValidationFailedError extends AppError {
  constructor(message: string = 'Validation error occurred.', errorDetails?: any) {
    super(message, 400, errorDetails);
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found.', errorDetails?: any) {
    super(message, 404, errorDetails);
  }
}


/**
 * Format validation errors from express-validator
 */
export const formatValidationErrors = (errors: ValidationError[]) => {
  return errors.map(error => {
    // If this is a ‘field’ error, it has .path
    if (error.type === 'field') {
      // TS now knows error is FieldError-like
      return {
        field: (error as FieldError).path,
        message: error.msg
      };
    } else {
      // fallback for other types (grouped, alternative, unknown_fields etc)
      return {
        field: '<unknown>',
        message: error.msg
      };
    }
  });
};