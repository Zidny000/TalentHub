import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthTokenPayload } from '../models/user.model';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware to validate JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const payload = verifyAccessToken<AuthTokenPayload>(token);
    
    if (!payload) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Add user data to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Unauthorized access'));
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError('Unauthorized access.', 'You must be an admin to perform this action.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check user role middleware
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError('Unauthorized access', `This action requires ${allowedRoles.join(' or ')} role`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};