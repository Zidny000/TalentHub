import express from 'express';
import authRoutes from './auth.routes';
import emailTestRoutes from './email-test.routes';
import resumeRoutes from './resume.routes';
import jobRoutes from './job.routes';
import { applicationRoutes } from './application.routes';
import { paymentRoutes } from './payment.routes';
import { employmentPaymentRoutes } from './employmentPayment.routes';
import { interviewRoutes } from './interview.routes';
import { jobOfferRoutes } from './jobOffer.routes';
import messageRoutes from './message.routes';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/email-test', emailTestRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/payments', paymentRoutes);
router.use('/employment-payments', employmentPaymentRoutes);
router.use('/interviews', interviewRoutes); // Interview routes
router.use('/job-offers', jobOfferRoutes); // Job offer routes
router.use('/messages', messageRoutes); // Message routes
router.use('/', applicationRoutes); // Application routes (some nested under /jobs)

export default router;