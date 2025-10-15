import express from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { 
  registerValidation, 
  loginValidation 
} from '../middlewares/validators';

const router = express.Router();

/**
 * Authentication Routes
 */
// POST /api/auth/register - Register new user
router.post('/register', validate(registerValidation), AuthController.register);

// GET /api/auth/verify-email - Verify email with token
router.get('/verify-email', AuthController.verifyEmail);

// POST /api/auth/login - User login
router.post('/login', validate(loginValidation), AuthController.login);

// POST /api/auth/verify-2fa - Verify 2FA code
router.post('/verify-2fa', AuthController.verify2FA);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', AuthController.refreshToken);

// POST /api/auth/logout - Logout user (revoke refresh token)
router.post('/logout', authenticate, AuthController.logout);

export default router;