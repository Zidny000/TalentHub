import { body } from 'express-validator';

export const resumeValidators = {
  createResume: [
    body('title')
      .notEmpty().withMessage('Title is required')
      .isString().withMessage('Title must be a string')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    
    body('summary')
      .optional()
      .isString().withMessage('Summary must be a string')
      .trim(),
    
    body('experiences')
      .optional()
      .isArray().withMessage('Experiences must be an array'),
    
    body('experiences.*.company')
      .optional()
      .isString().withMessage('Company must be a string'),
    
    body('experiences.*.position')
      .optional()
      .isString().withMessage('Position must be a string'),
    
    body('experiences.*.startDate')
      .optional()
      .isString().withMessage('Start date must be a string'),
    
    body('experiences.*.endDate')
      .optional()
      .isString().withMessage('End date must be a string'),
    
    body('experiences.*.description')
      .optional()
      .isString().withMessage('Description must be a string'),
    
    body('skills')
      .optional()
      .isString().withMessage('Skills must be a comma-separated string')
      .trim()
  ],
  
  updateResume: [
    body('title')
      .optional()
      .isString().withMessage('Title must be a string')
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    
    body('summary')
      .optional()
      .isString().withMessage('Summary must be a string')
      .trim(),
    
    body('experiences')
      .optional()
      .isArray().withMessage('Experiences must be an array'),
    
    body('experiences.*.company')
      .optional()
      .isString().withMessage('Company must be a string'),
    
    body('experiences.*.position')
      .optional()
      .isString().withMessage('Position must be a string'),
    
    body('experiences.*.startDate')
      .optional()
      .isString().withMessage('Start date must be a string'),
    
    body('experiences.*.endDate')
      .optional()
      .isString().withMessage('End date must be a string'),
    
    body('experiences.*.description')
      .optional()
      .isString().withMessage('Description must be a string'),
    
    body('skills')
      .optional()
      .isString().withMessage('Skills must be a comma-separated string')
      .trim()
  ]
};