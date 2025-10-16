import { body } from 'express-validator';

/**
 * Validation rules for scheduling an interview
 */
export const scheduleInterview = [
  body('scheduledAt')
    .notEmpty().withMessage('Interview date and time is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Interview must be scheduled in the future');
      }
      return true;
    }),
  
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes'),
  
  body('location')
    .optional()
    .isString().withMessage('Location must be a string')
    .isLength({ max: 255 }).withMessage('Location must not exceed 255 characters'),
    
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
];

/**
 * Validation rules for updating an interview
 */
export const updateInterview = [
  body('scheduledAt')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Interview must be scheduled in the future');
      }
      return true;
    }),
  
  body('duration')
    .optional()
    .isInt({ min: 15, max: 240 }).withMessage('Duration must be between 15 and 240 minutes'),
  
  body('location')
    .optional()
    .isString().withMessage('Location must be a string')
    .isLength({ max: 255 }).withMessage('Location must not exceed 255 characters'),
    
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
];

/**
 * Validation rules for canceling an interview
 */
export const cancelInterview = [
  body('reason')
    .optional()
    .isString().withMessage('Reason must be a string')
    .isLength({ max: 1000 }).withMessage('Reason must not exceed 1000 characters')
];

/**
 * Validation rules for completing an interview
 */
export const completeInterview = [
  body('feedback')
    .optional()
    .isString().withMessage('Feedback must be a string')
    .isLength({ max: 1000 }).withMessage('Feedback must not exceed 1000 characters')
];

export const interviewValidators = {
  scheduleInterview,
  updateInterview,
  cancelInterview,
  completeInterview
};