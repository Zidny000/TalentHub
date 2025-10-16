import { body, param } from 'express-validator';

export const jobOfferValidators = {
  /**
   * Validation rules for creating a job offer
   */
  createJobOffer: [
    body('title')
      .notEmpty().withMessage('Job title is required')
      .isString().withMessage('Title must be a string')
      .trim()
      .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),
    
    body('description')
      .optional()
      .isString().withMessage('Description must be a string')
      .trim()
      .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
    
    body('salary')
      .notEmpty().withMessage('Salary is required')
      .isInt({ min: 0 }).withMessage('Salary must be a positive number'),
      
    body('benefits')
      .optional()
      .isString().withMessage('Benefits must be a string')
      .trim()
      .isLength({ max: 1000 }).withMessage('Benefits must not exceed 1000 characters'),
    
    body('startDate')
      .optional()
      .isISO8601().withMessage('Invalid date format for start date')
      .custom((value) => {
        const startDate = new Date(value);
        const now = new Date();
        if (startDate <= now) {
          throw new Error('Start date must be in the future');
        }
        return true;
      }),
      
    body('expirationDate')
      .notEmpty().withMessage('Expiration date is required')
      .isISO8601().withMessage('Invalid date format for expiration date')
      .custom((value) => {
        const expirationDate = new Date(value);
        const now = new Date();
        if (expirationDate <= now) {
          throw new Error('Expiration date must be in the future');
        }
        return true;
      }),
      
    body('notes')
      .optional()
      .isString().withMessage('Notes must be a string')
      .trim()
      .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
      
    body('interviewId')
      .optional()
      .isString().withMessage('Interview ID must be a string')
      .isUUID().withMessage('Invalid interview ID format')
  ],

  /**
   * Validation rules for withdrawing a job offer
   */
  withdrawJobOffer: [
    param('id')
      .isUUID().withMessage('Invalid job offer ID format'),
    
    body('reason')
      .optional()
      .isString().withMessage('Reason must be a string')
      .trim()
      .isLength({ max: 1000 }).withMessage('Reason must not exceed 1000 characters')
  ],

  /**
   * Validation rules for rejecting a job offer
   */
  rejectJobOffer: [
    param('id')
      .isUUID().withMessage('Invalid job offer ID format'),
    
    body('reason')
      .optional()
      .isString().withMessage('Reason must be a string')
      .trim()
      .isLength({ max: 1000 }).withMessage('Reason must not exceed 1000 characters')
  ],
  
  /**
   * Validation for job offer ID parameter
   */
  jobOfferId: [
    param('id')
      .isUUID().withMessage('Invalid job offer ID format')
  ],
  
  /**
   * Validation for application ID parameter
   */
  applicationId: [
    param('applicationId')
      .isUUID().withMessage('Invalid application ID format')
  ]
};