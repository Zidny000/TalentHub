import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();
type User = Awaited<ReturnType<typeof prisma.user.findUnique>>;
type UserRole = 'ADMIN' | 'EMPLOYER' | 'CANDIDATE';
type TwoFactorMethod = 'EMAIL';

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerificationTokenPayload {
  userId: string;
  email: string;
  type: 'email-verification' | '2fa';
  expires: number;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType?: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  email: string;
  tokenId: string;
  tokenType: 'refresh';
}

export interface TwoFactorVerifyInput {
  email: string;
  code: string;
}

// Base response interface with success flag
export interface BaseResponse {
  success: boolean;
  message: string;
}

// Error response interface
export interface ErrorResponse extends BaseResponse {
  success: false;
  errorDetails?: any;
}

// Success response interface
export interface SuccessResponse extends BaseResponse {
  success: true;
  statusCode: number;
  data?: any;
}

// Return types for authentication services
export interface AuthSuccessResponse extends SuccessResponse {
  success: true;
  message: string;
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorRequiredResponse extends SuccessResponse {
  requiresTwoFactor: true;
  user: Omit<User, 'passwordHash'>;
}

export type AuthResponse = AuthSuccessResponse | TwoFactorRequiredResponse;

export interface RefreshTokenResponse extends SuccessResponse {
  accessToken: string;
  refreshToken: string;
}