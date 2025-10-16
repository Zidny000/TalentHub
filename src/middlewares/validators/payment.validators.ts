import { param } from 'express-validator';

export const paymentValidators = {
  // Validate job ID param
  jobPayment: [
    param('id')
      .isUUID()
      .withMessage('Invalid job ID format')
  ]
};