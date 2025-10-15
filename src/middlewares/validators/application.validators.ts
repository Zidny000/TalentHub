import { body, param } from 'express-validator';

export const applicationValidators = {
  applyToJob: [
    param('id')
      .isUUID().withMessage('Invalid job ID format'),
    
    body('resumeId')
      .optional()
      .isUUID().withMessage('Invalid resume ID format'),
    
    body('coverLetter')
      .optional()
      .isString().withMessage('Cover letter must be a string')
      .isLength({ max: 5000 }).withMessage('Cover letter cannot exceed 5000 characters')
  ],

  getJobApplications: [
    param('id')
      .isUUID().withMessage('Invalid job ID format')
  ],

  getApplicationDetails: [
    param('id')
      .isUUID().withMessage('Invalid application ID format')
  ],

  exportJobApplications: [
    param('id')
      .isUUID().withMessage('Invalid job ID format')
  ]
};