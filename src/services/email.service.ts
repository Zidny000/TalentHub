import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 465,
  secure: process.env.EMAIL_PORT === '465',
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<boolean> => {
  // For frontend verification
  const frontendVerificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  // For API testing (without frontend)
  const apiVerificationLink = `${process.env.API_URL || 'http://localhost:3000'}/api/email-test/show-verification?token=${token}`;
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verify Your TalentHub Account',
      html: `
        <h1>Welcome to TalentHub!</h1>
        <p>Please verify your email address by clicking the link below ( When frontend is available ):</p>
        <p><a href="${frontendVerificationLink}">Verify Email</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>For checking the verification (without frontend):</p>
        <p><a href="${apiVerificationLink}">Test Verification</a></p>
        <p>If you did not create this account, please ignore this email.</p>
      `
    });
    
    logger.info(`Email verification sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    return false;
  }
};

/**
 * Send 2FA verification code
 */
export const send2FAEmail = async (
  to: string,
  code: string
): Promise<boolean> => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Your TalentHub 2FA Code',
      html: `
        <h1>Two-Factor Authentication</h1>
        <p>Your verification code is:</p>
        <h2 style="font-size: 24px; letter-spacing: 5px; background-color: #f4f4f4; padding: 10px; text-align: center;">${code}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, please secure your account immediately.</p>
      `
    });
    
    logger.info(`2FA code sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending 2FA email:', error);
    return false;
  }
};