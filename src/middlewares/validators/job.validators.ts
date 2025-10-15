import { body, query, param } from 'express-validator';

export const jobValidators = {
  createJob: [
    body('title')
      .notEmpty().withMessage('Title is required')
      .isString().withMessage('Title must be a string')
      .trim()
      .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    
    body('description')
      .notEmpty().withMessage('Description is required')
      .isString().withMessage('Description must be a string')
      .trim()
      .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    
    body('requirements')
      .optional()
      .isString().withMessage('Requirements must be a string')
      .trim(),
    
    body('location')
      .optional()
      .isString().withMessage('Location must be a string')
      .trim(),
    
    body('type')
      .notEmpty().withMessage('Job type is required')
      .isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP'])
      .withMessage('Invalid job type'),
    
    body('salaryMin')
      .optional()
      .isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),
    
    body('salaryMax')
      .optional()
      .isInt({ min: 0 }).withMessage('Maximum salary must be a positive number')
      .custom((value, { req }) => {
        if (req.body.salaryMin && parseInt(value) < parseInt(req.body.salaryMin)) {
          throw new Error('Maximum salary must be greater than or equal to minimum salary');
        }
        return true;
      }),
    
    body('isPaidPost')
      .optional()
      .isBoolean().withMessage('isPaidPost must be a boolean')
  ],
  
  updateJob: [
    body('title')
      .optional()
      .isString().withMessage('Title must be a string')
      .trim()
      .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
    
    body('description')
      .optional()
      .isString().withMessage('Description must be a string')
      .trim()
      .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
    
    body('requirements')
      .optional()
      .isString().withMessage('Requirements must be a string')
      .trim(),
    
    body('location')
      .optional()
      .isString().withMessage('Location must be a string')
      .trim(),
    
    body('type')
      .optional()
      .isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP'])
      .withMessage('Invalid job type'),
    
    body('salaryMin')
      .optional()
      .isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),
    
    body('salaryMax')
      .optional()
      .isInt({ min: 0 }).withMessage('Maximum salary must be a positive number')
      .custom((value, { req }) => {
        if (req.body.salaryMin && parseInt(value) < parseInt(req.body.salaryMin)) {
          throw new Error('Maximum salary must be greater than or equal to minimum salary');
        }
        return true;
      })
  ],
  
  listJobs: [
    query('q')
      .optional()
      .isString().withMessage('Search query must be a string'),
    
    query('type')
      .optional()
      .isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP'])
      .withMessage('Invalid job type'),
    
    query('location')
      .optional()
      .isString().withMessage('Location must be a string'),
    
    query('minSalary')
      .optional()
      .isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),
    
    query('maxSalary')
      .optional()
      .isInt({ min: 0 }).withMessage('Maximum salary must be a positive number'),
    
    query('active')
      .optional()
      .isIn(['true', 'false']).withMessage('Active must be true or false'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive number'),
    
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100')
  ],
  
  jobId: [
    param('id')
      .isUUID().withMessage('Invalid job ID format')
  ]
};