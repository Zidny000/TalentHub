import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationFailedError, formatValidationErrors } from '../utils/errors';

/**
 * Middleware to validate request using express-validator
 * @param validations - Array of validation chains from express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check if there are validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors and throw a validation error
    const formattedErrors = formatValidationErrors(errors.array());
    next(new ValidationFailedError('Validation error occurred.', formattedErrors));
  };
};