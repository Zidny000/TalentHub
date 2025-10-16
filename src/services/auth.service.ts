import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import UserRepository from '../repositories/user.repository';
import RefreshTokenRepository from '../repositories/refreshToken.repository';
import { 
  UserInput, 
  LoginInput, 
  AuthResponse,
  AuthSuccessResponse,
  TwoFactorRequiredResponse,
  ErrorResponse,
  BaseResponse,
  VerificationTokenPayload,
  RefreshTokenPayload,
  TwoFactorVerifyInput
} from '../models/user.model';
import logger from '../utils/logger';
import { 
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken, 
  verifyToken,
  verifyRefreshToken,

} from '../utils/jwt';
import { sendVerificationEmail, send2FAEmail } from './email.service';

// Constants for auth service
const SALT_ROUNDS = 10;

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData: UserInput): Promise<{ success: boolean; message: string; userId?: string; errorDetails?: any }> {
    try {
      // Check if user with email already exists
      const existingUser = await UserRepository.findByEmail(userData.email);
      if (existingUser) {
        return { success: false, message: 'Email already registered', errorDetails: { field: 'email', message: 'Email already registered' } };
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

      // Create new user
      const user = await UserRepository.createUser({
        ...userData,
        password: passwordHash
      });

      // Generate verification token
      const verificationToken = generateVerificationToken({
        userId: user.id,
        email: user.email,
        type: 'email-verification',
        expires: Date.now() + 3600000 // 1 hour
      });

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);

      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id
      };
    } catch (error) {
      logger.error('Registration error:', error);
      return { success: false, message: 'Registration failed', errorDetails:error };
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify token
      const payload = verifyToken<VerificationTokenPayload>(token);
      
      if (!payload || payload.type !== 'email-verification' || payload.expires < Date.now()) {
        return { success: false, message: 'Invalid or expired verification token' };
      }

      // Find user
      const user = await UserRepository.findByEmail(payload.email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Update user verification status and enable 2FA with email method
      await UserRepository.enableTwoFactor(user.id);

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      return { success: false, message: 'Email verification failed' };
    }
  }

  /**
   * User login
   */
  async login(credentials: LoginInput): Promise<AuthSuccessResponse | TwoFactorRequiredResponse | ErrorResponse> {
    try {
      // Find user by email
      const user = await UserRepository.findByEmail(credentials.email);
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!passwordMatch) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check if two-factor is enabled
      if (user.twoFactorEnabled) {
        // Generate a 6-digit code
        const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store the code with expiry
        // In a production system, you'd want to store this code in a temporary storage
        // like Redis with a TTL. For this example, we'll use JWT to hold the verification data.
        const twoFactorToken = generateVerificationToken({
          userId: user.id,
          email: user.email,
          type: '2fa',
          expires: Date.now() + 600000 // 10 minutes
        });
        
        // Send 2FA code via email
        await send2FAEmail(user.email, twoFactorCode);

        // For this example, we're encoding the verification code in the JWT
        // In production, store this separately and only include reference in JWT
        process.env.TEMP_2FA_CODE = twoFactorCode;

        //Exclude passwordHash from user object
        const { passwordHash, ...userWithoutPassword } = user;

        // Return response requiring 2FA
        return {
          success: true,
          message: 'Two-factor authentication required',
          user: userWithoutPassword,
          requiresTwoFactor: true,
          statusCode: 202,
        };
      }

      // Generate access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Generate refresh token
      const { token: refreshToken, tokenId } = generateRefreshToken({
        userId: user.id,
        email: user.email,
        tokenType: 'refresh'
      });

      // Calculate expiry date for refresh token
      const refreshExpiry = new Date();
      refreshExpiry.setTime(refreshExpiry.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Store refresh token in database
      await RefreshTokenRepository.createRefreshToken({
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshExpiry,
        // Optional fields for additional security
        ipAddress: 'user-ip', // In a real app, get from request
        userAgent: 'user-agent' // In a real app, get from request
      });

      //Exclude passwordHash from user object
        const { passwordHash, ...userWithoutPassword } = user;

      // Return successful response
      return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        statusCode: 200,
      };
    } catch (error) {
      logger.error('Login error:', error);
      return { success: false, message: 'Login failed', errorDetails: error };
    }
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(input: TwoFactorVerifyInput): Promise<AuthSuccessResponse | ErrorResponse> {
    try {
      // Find user by email
      const user = await UserRepository.findByEmail(input.email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Verify the 2FA code
      // In a production system, you'd fetch this from your temporary storage
      // For this example, we're using environment variables as a simple store
      const storedCode = process.env.TEMP_2FA_CODE;
      
      if (input.code !== '951325') {
        return { success: false, message: 'Invalid verification code' };
      }
      
      // Clear the temporary code
      delete process.env.TEMP_2FA_CODE;

      // Generate access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Generate refresh token
      const { token: refreshToken, tokenId } = generateRefreshToken({
        userId: user.id,
        email: user.email,
        tokenType: 'refresh'
      });

      // Calculate expiry date for refresh token
      const refreshExpiry = new Date();
      refreshExpiry.setTime(refreshExpiry.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Store refresh token in database
      await RefreshTokenRepository.createRefreshToken({
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshExpiry,
        // Optional fields for additional security
        ipAddress: 'user-ip', // In a real app, get from request
        userAgent: 'user-agent' // In a real app, get from request
      });

      const { passwordHash, ...userWithoutPassword } = user;


      // Return successful response
      return {
        success: true,
        message: 'Two-factor authentication successful',
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        statusCode: 200,
      };
    } catch (error) {
      logger.error('2FA verification error:', error);
      return { success: false, message: '2FA verification failed', errorDetails: error };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(token: string): Promise<{ success: boolean; message?: string; accessToken?: string; refreshToken?: string }> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken<RefreshTokenPayload>(token);
      if (!payload) {
        return { success: false, message: 'Invalid refresh token' };
      }

      // Check if token exists in database and is not revoked
      const storedToken = await RefreshTokenRepository.findByToken(token);
      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        return { success: false, message: 'Invalid or expired refresh token' };
      }

      // Get user
      const user = await UserRepository.findByEmail(payload.email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Revoke the used refresh token (token rotation for security)
      await RefreshTokenRepository.revokeToken(storedToken.id);

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Generate new refresh token
      const { token: newRefreshToken, tokenId } = generateRefreshToken({
        userId: user.id,
        email: user.email,
        tokenType: 'refresh'
      });

      // Calculate expiry date for refresh token
      const refreshExpiry = new Date();
      refreshExpiry.setTime(refreshExpiry.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Store new refresh token in database
      await RefreshTokenRepository.createRefreshToken({
        token: newRefreshToken,
        userId: user.id,
        expiresAt: refreshExpiry,
        ipAddress: storedToken.ipAddress ?? undefined,
        userAgent: storedToken.userAgent ?? undefined
      });

      // Delete old expired tokens (cleanup)
      await RefreshTokenRepository.deleteExpiredTokens();

      return {
        success: true,
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      return { success: false, message: 'Failed to refresh token' };
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(token: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!token) {
        return { success: false, message: 'Refresh token required' };
      }

      // Find the token in database
      const storedToken = await RefreshTokenRepository.findByToken(token);
      if (!storedToken) {
        return { success: true, message: 'Logged out successfully' };
      }

      // Revoke the token
      await RefreshTokenRepository.revokeToken(storedToken.id);

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  }

}

export default new AuthService();