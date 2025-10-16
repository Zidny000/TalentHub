import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { resumeValidators } from '../middlewares/validators';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// Create a new resume
router.post('/', validate(resumeValidators.createResume), resumeController.create.bind(resumeController));

// Get all resumes for the current user
router.get('/my-resumes', 
  cacheMiddleware({ ttl: 600, keyPrefix: 'resumes', includeUserId: true }), 
  resumeController.getByUserId.bind(resumeController)
);

// Get a specific resume by ID
router.get('/:id', 
  cacheMiddleware({ ttl: 600, keyPrefix: 'resumes:detail' }), 
  resumeController.getById.bind(resumeController)
);

// Get resume as PDF
router.get('/:id/pdf',
  cacheMiddleware({ ttl: 3600, keyPrefix: 'resumes:pdf' }), // PDF can be cached longer
  resumeController.getPdf.bind(resumeController)
);

// Update a resume
router.put('/:id', validate(resumeValidators.updateResume), resumeController.update.bind(resumeController));

// Delete a resume
router.delete('/:id', resumeController.delete.bind(resumeController));

export default router;