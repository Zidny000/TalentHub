import express from 'express';
import authRoutes from './auth.routes';
import emailTestRoutes from './email-test.routes';
import resumeRoutes from './resume.routes';
import jobRoutes from './job.routes';
import { applicationRoutes } from './application.routes';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/email-test', emailTestRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/', applicationRoutes); // Application routes (some nested under /jobs)

export default router;