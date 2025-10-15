import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { resumeValidators } from '../middlewares/validators';

const router = Router();

// All resume routes require authentication
router.use(authenticate);

// Create a new resume
router.post('/', validate(resumeValidators.createResume), resumeController.create.bind(resumeController));

// Get all resumes for the current user
router.get('/my-resumes', resumeController.getByUserId.bind(resumeController));

// Get a specific resume by ID
router.get('/:id', resumeController.getById.bind(resumeController));

// Get resume as PDF
router.get('/:id/pdf', resumeController.getPdf.bind(resumeController));

// Update a resume
router.put('/:id', validate(resumeValidators.updateResume), resumeController.update.bind(resumeController));

// Delete a resume
router.delete('/:id', resumeController.delete.bind(resumeController));

export default router;