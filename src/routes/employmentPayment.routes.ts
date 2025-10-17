import { Router } from 'express';
import { employmentPaymentController } from '../controllers/employmentPayment.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { employmentPaymentValidators } from '../middlewares/validators';

const router = Router();

// All routes need authentication
router.use(authenticate);

// Create a new employment payment (employer to candidate)
router.post(
  '/create',
  checkRole(['EMPLOYER']),
  validate(employmentPaymentValidators.createEmploymentPayment),
  employmentPaymentController.createEmploymentPaymentSession.bind(employmentPaymentController)
);

// Verify payment success
router.get(
  '/verify-success',
  employmentPaymentController.verifyPaymentSuccess.bind(employmentPaymentController)
);

// Get payments made by an employer
router.get(
  '/sent',
  checkRole(['EMPLOYER']),
  employmentPaymentController.getEmployerPayments.bind(employmentPaymentController)
);

// Get payments received by a candidate
router.get(
  '/received',
  checkRole(['CANDIDATE']),
  employmentPaymentController.getCandidatePayments.bind(employmentPaymentController)
);

export const employmentPaymentRoutes = router;