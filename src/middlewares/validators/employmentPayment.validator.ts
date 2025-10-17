import { body } from 'express-validator';

export const employmentPaymentValidators = {
  createEmploymentPayment: [
    body('candidateId')
      .notEmpty()
      .withMessage('Candidate ID is required')
      .isString()
      .withMessage('Candidate ID must be a string'),
      
    body('jobOfferId')
      .notEmpty()
      .withMessage('Job offer ID is required')
      .isString()
      .withMessage('Job offer ID must be a string'),
      
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isInt({ min: 1 })
      .withMessage('Amount must be a positive integer (in cents)'),
      
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
  ]
};