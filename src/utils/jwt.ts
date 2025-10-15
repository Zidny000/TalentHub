import jwt, { SignOptions, Secret  } from 'jsonwebtoken';
import { AuthTokenPayload, RefreshTokenPayload, VerificationTokenPayload } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

// JWT Secret keys - should be in environment variables
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'kuyfuf' as string;
const REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || 'uyfuyg' as string;

// Token expiration times (in seconds for easier handling with .env)
const ACCESS_TOKEN_EXPIRY = parseInt(process.env.ACCESS_TOKEN_EXPIRY || '900', 10); // 15 minutes default
const REFRESH_TOKEN_EXPIRY = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '2592000', 10); // 30 days default

// Token expiration times (for non-access/refresh tokens)
const TOKEN_EXPIRY = {
  VERIFICATION: '1h',      // Email verification token valid for 1 hour
  TWO_FACTOR: '10m'        // 2FA token valid for 10 minutes
};

/**
 * Generate short-lived access token
 */
export const generateAccessToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(
    { ...payload, tokenType: 'access' }, 
    JWT_SECRET, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate long-lived refresh token
 */
export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'tokenId'>): { token: string, tokenId: string } => {
  const tokenId = uuidv4();
  const token = jwt.sign(
    { ...payload, tokenId, tokenType: 'refresh' }, 
    REFRESH_SECRET, 
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return { token, tokenId };
};

/**
 * Generate email verification token
 */
export const generateVerificationToken = (payload: VerificationTokenPayload): string => {
 const options: SignOptions = {
    expiresIn: TOKEN_EXPIRY.VERIFICATION as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload as object, JWT_SECRET, options);
};

/**
 * Generate 2FA verification token
 */
export const generateTwoFactorToken = (payload: VerificationTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: TOKEN_EXPIRY.TWO_FACTOR as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload as object, JWT_SECRET, options);
};

/**
 * Verify access token
 */
export const verifyAccessToken = <T>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as T & { tokenType?: string };
    // Ensure this is an access token
    if (decoded.tokenType !== 'access') {
      return null;
    }
    return decoded as T;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = <T>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as T & { tokenType?: string };
    // Ensure this is a refresh token
    if (decoded.tokenType !== 'refresh') {
      return null;
    }
    return decoded as T;
  } catch (error) {
    return null;
  }
};

/**
 * Verify token (for verification tokens, 2FA tokens)
 */
export const verifyToken = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (error) {
    return null;
  }
};