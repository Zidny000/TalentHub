import { body } from 'express-validator';
import { resumeValidators } from './resume.validators';
import { jobValidators } from './job.validators';
import { interviewValidators } from './interview.validators';

/**
 * Validation rules for user registration
 */
export const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
    
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('role')
    .optional()
    .isIn(['ADMIN', 'EMPLOYER', 'CANDIDATE']).withMessage('Invalid role')
];

/**
 * Validation rules for login
 */
export const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Export validators
export { resumeValidators };
export { jobValidators };
export { interviewValidators };
export { applicationValidators } from './application.validators';
export { paymentValidators } from './payment.validators';
export { jobOfferValidators } from './jobOffer.validators';
