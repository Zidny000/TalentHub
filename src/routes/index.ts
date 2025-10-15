import express from 'express';
import authRoutes from './auth.routes';
import emailTestRoutes from './email-test.routes';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/email-test', emailTestRoutes);

export default router;