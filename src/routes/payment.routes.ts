import express, { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, checkRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { paymentValidators } from '../middlewares/validators';

const router = Router();

// Public webhook for Stripe (no auth required)
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook.bind(paymentController)
);

// Protected payment routes
router.use(authenticate);

// Create payment session for job posting (employer only)
router.post(
  '/jobs/:id/payment',
  checkRole(['EMPLOYER']),
  validate(paymentValidators.jobPayment),
  paymentController.createJobPostPaymentSession.bind(paymentController)
);

export const paymentRoutes = router;