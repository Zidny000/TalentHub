
import logger from '../utils/logger';
import  axios  from "axios";



/**
 * Send email verification link
 */
export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<boolean> => {
  // For frontend verification
  const frontendVerificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/v1/verify-email?token=${token}`;
  
  // For API testing (without frontend)
  const apiVerificationLink = `${process.env.API_URL || 'http://localhost:3000'}/api/v1/email-test/show-verification?token=${token}`;

    const emailData = {
      
      "sender":{
        "name":"TalentHub",
        "email":"t.m.zidny@gmail.com"
      },
      
      to:[{
        email:to
      }],

      subject:'Verify Your TalentHub Account',
      htmlContent:`
        <h1>Welcome to TalentHub!</h1>
        <p>Please verify your email address by clicking the link below ( When frontend is available ):</p>
        <p><a href="${frontendVerificationLink}">Verify Email</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>For checking the verification (without frontend):</p>
        <p><a href="${apiVerificationLink}">Test Verification</a></p>
        <p>If you did not create this account, please ignore this email.</p>
      `
    };

    try{
      await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
        headers: {
          'api-key': process.env.BREVO_API_KEY || '',
        }
      });
      logger.info(`Email verification sent;`);
      return true;
    } catch (error: any) {
      logger.error('Error sending verification email:', error.message || 'Unknown error');
      return false;
    }
  
}

/** 
 * Send 2FA code email
 */
export const send2FAEmail = async (
  to: string,
  code: string
): Promise<boolean> => { 

  const emailData = {
    "sender": {
      "name": "TalentHub",
      "email": "t.m.zidny@gmail.com"
    },
    "to": [{
      "email": to
    }],
    "subject": "Your TalentHub 2FA Code",
    "htmlContent": `
      <h1>Two-Factor Authentication</h1>
      <p>Your verification code is:</p>
      <h2 style="font-size: 24px; letter-spacing: 5px; background-color: #f4f4f4; padding: 10px; text-align: center;">${code}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this code, please secure your account immediately.</p>
    `
  };

  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      }
    });
    logger.info(`2FA code sent to ${to}`);
    return true;
  } catch (error: any) {
    logger.error('Error sending 2FA email:', error.message || 'Unknown error');
    return false;
  }
};
