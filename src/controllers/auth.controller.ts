import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { UserInput, LoginInput, TwoFactorVerifyInput } from '../models/user.model';
import { ValidationFailedError } from '../utils/errors';
import { ResponseFormatter } from '../utils/response';
import logger from '../utils/logger';

/**
 * Authentication Controller
 */
class AuthController {
  /**
   * Register new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: UserInput = req.body;
      
      // Validate request body
      if (!userData.name || !userData.email || !userData.password) {
        throw new ValidationFailedError('Validation error occurred.', {
          field: !userData.name ? 'name' : !userData.email ? 'email' : 'password',
          message: 'Name, email and password are required'
        });
      }
      
      const result = await AuthService.register(userData);
      
      if (result.success) {
        return ResponseFormatter.success(res, result.message, { userId: result.userId }, 201);
      } else {
        return ResponseFormatter.error(res, result.message, result.errorDetails, 400);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        throw new ValidationFailedError('Validation error occurred.', { 
          field: 'token', 
          message: 'Verification token is required' 
        });
      }
      
      const result = await AuthService.verifyEmail(token);
      
      if (result.success) {
        return ResponseFormatter.success(res, result.message, result);
      } else {
        return ResponseFormatter.error(res, result.message);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const credentials: LoginInput = req.body;
      
      // Validate request body
      if (!credentials.email || !credentials.password) {
        throw new ValidationFailedError('Validation error occurred.', {
          field: !credentials.email ? 'email' : 'password',
          message: 'Email and password are required'
        });
      }
      
      const result = await AuthService.login(credentials);
      
      // Handle error response
      if ('success' in result && result.success === false) {
        return ResponseFormatter.unauthorized(res, result.message);
      }
      
      // If 2FA is required, return 202 status
      if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
        return ResponseFormatter.success(
          res, 
          'Two-factor authentication required', 
          {
            requiresTwoFactor: true,
            email: credentials.email,
            user: result.user
          },
          202
        );
      }
      
      // Regular successful login
      if (!('requiresTwoFactor' in result)) {
        return ResponseFormatter.success(
          res, 
          'Login successful', 
          {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
          }
        );
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify two-factor authentication
   */
  async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const input: TwoFactorVerifyInput = req.body;
      
      // Validate request body
      if (!input.email || !input.code) {
        throw new ValidationFailedError('Validation error occurred.', {
          field: !input.email ? 'email' : 'code',
          message: 'Email and verification code are required'
        });
      }
      
      const result = await AuthService.verify2FA(input);
      
      if ('success' in result && result.success === false) {
        return ResponseFormatter.unauthorized(res, result.message);
      }
      
      // Successful 2FA verification
      return ResponseFormatter.success(
        res, 
        'Two-factor authentication successful', 
        {
          user: 'user' in result ? result.user : null,
          accessToken: 'accessToken' in result ? result.accessToken : '',
          refreshToken: 'refreshToken' in result ? result.refreshToken : ''
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new ValidationFailedError('Validation error occurred.', {
          field: 'refreshToken',
          message: 'Refresh token is required'
        });
      }
      
      const result = await AuthService.refreshToken(refreshToken);
      
      if (!result.success) {
        return ResponseFormatter.unauthorized(res, result.message || 'Token refresh failed');
      }
      
      return ResponseFormatter.success(
        res, 
        'Token refreshed successfully', 
        {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new ValidationFailedError('Validation error occurred.', {
          field: 'refreshToken',
          message: 'Refresh token is required'
        });
      }
      
      const result = await AuthService.logout(refreshToken);
      
      return ResponseFormatter.success(res, result.message);
    } catch (error) {
      next(error);
    }
  }

}

export default new AuthController();