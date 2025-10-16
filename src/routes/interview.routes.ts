import express from 'express';
import { interviewController } from '../controllers/interview.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { interviewValidators } from '../middlewares/validators/interview.validators';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

// Get interviews for logged-in user
router.get('/', interviewController.getMyInterviews);

// Get specific interview details
router.get('/:id', interviewController.getInterview);

// Update interview details (mainly for rescheduling)
router.patch(
  '/:id',
  validate(interviewValidators.updateInterview),
  interviewController.updateInterview
);

// Cancel an interview
router.post(
  '/:id/cancel',
  validate(interviewValidators.cancelInterview),
  interviewController.cancelInterview
);

// Mark an interview as completed
router.post(
  '/:id/complete',
  validate(interviewValidators.completeInterview),
  interviewController.completeInterview
);

// Schedule an interview for an application
router.post(
  '/application/:applicationId',
  checkRole(['EMPLOYER', 'ADMIN']),
  validate(interviewValidators.scheduleInterview),
  interviewController.scheduleInterview
);

// Get interviews for a specific application
router.get(
  '/application/:applicationId',
  interviewController.getApplicationInterviews
);

export const interviewRoutes = router;