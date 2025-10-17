import express from 'express';
import { Request, Response } from 'express';
import * as EmailService from '../services/email.service';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';

const router = express.Router();

/**
 * Email Testing Routes
 * These endpoints allow testing email functionality without a frontend
 */
router.get('/show-verification', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }
    
    // Display a simple HTML page with token info
    const htmlPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verification Test</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 20px;
              margin-top: 20px;
            }
            .token-display {
              background: #f4f4f4;
              padding: 10px;
              border-radius: 3px;
              word-break: break-all;
            }
            .button {
              display: inline-block;
              background: #4CAF50;
              color: white;
              padding: 10px 20px;
              margin: 20px 0;
              border-radius: 5px;
              text-decoration: none;
              cursor: pointer;
            }
            .result {
              margin-top: 20px;
              padding: 10px;
              border-radius: 3px;
            }
            .success {
              background: #dff0d8;
              color: #3c763d;
            }
            .error {
              background: #f2dede;
              color: #a94442;
            }
          </style>
        </head>
        <body>
          <h1>Email Verification Test</h1>
          <div class="container">
            <h2>Token Information</h2>
            <p>The following token was received from your email:</p>
            <div class="token-display">${token}</div>
            
            <h2>Verify Email</h2>
            <p>Click the button below to verify your email (this simulates a user clicking the link in their email):</p>
            <a class="button" href="/api/v1/email-test/process-verification?token=${token}">Verify Email</a>
            
            <p>Alternatively, you can use the normal API endpoint:</p>
            <code>GET /api/v1/auth/verify-email?token=${token}</code>
          </div>
        </body>
      </html>
    `;
    
    res.send(htmlPage);
  } catch (error) {
    logger.error('Error in show-verification endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing verification page' 
    });
  }
});

// GET /api/email-test/process-verification - Process verification token and show results
router.get('/process-verification', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Verification Error</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 20px;
                margin-top: 20px;
              }
              .result {
                margin-top: 20px;
                padding: 10px;
                border-radius: 3px;
              }
              .error {
                background: #f2dede;
                color: #a94442;
              }
            </style>
          </head>
          <body>
            <h1>Email Verification Error</h1>
            <div class="container">
              <div class="result error">
                <h2>Error</h2>
                <p>Verification token is required</p>
              </div>
            </div>
          </body>
        </html>
      `;
      return res.status(400).send(errorHtml);
    }
    
    // Process verification using AuthService
    const result = await AuthService.verifyEmail(token);
    
    // Generate HTML response based on verification result
    const resultHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verification ${result.success ? 'Success' : 'Error'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 20px;
              margin-top: 20px;
            }
            .result {
              margin-top: 20px;
              padding: 10px;
              border-radius: 3px;
            }
            .success {
              background: #dff0d8;
              color: #3c763d;
            }
            .error {
              background: #f2dede;
              color: #a94442;
            }
          </style>
        </head>
        <body>
          <h1>Email Verification ${result.success ? 'Success' : 'Error'}</h1>
          <div class="container">
            <div class="result ${result.success ? 'success' : 'error'}">
              <h2>${result.success ? 'Success' : 'Error'}</h2>
              <p>${result.message}</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    res.send(resultHtml);
  } catch (error) {
    logger.error('Error in process-verification endpoint:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verification Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 20px;
              margin-top: 20px;
            }
            .result {
              margin-top: 20px;
              padding: 10px;
              border-radius: 3px;
            }
            .error {
              background: #f2dede;
              color: #a94442;
            }
          </style>
        </head>
        <body>
          <h1>Email Verification Error</h1>
          <div class="container">
            <div class="result error">
              <h2>Error</h2>
              <p>An unexpected error occurred while processing your verification.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    res.status(500).send(errorHtml);
  }
});

// POST /api/email-test/view-email-content - Preview email verification template
router.post('/view-email-content', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }
    
    // Generate a test token (don't store it)
    const testToken = 'TEST_TOKEN_' + Date.now();
    
    // Build verification link
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${testToken}`;
    
    // Test email template without sending
    const emailHTML = `
      <h1>Welcome to TalentHub!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not create this account, please ignore this email.</p>
    `;
    
    // Display a page showing the email content and verification link
    const responseHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Preview</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #ddd;
              border-radius: 5px;
              padding: 20px;
              margin-top: 20px;
            }
            .email-preview {
              border: 1px solid #ccc;
              padding: 20px;
              margin: 20px 0;
              background: #f9f9f9;
            }
            .link-display {
              background: #f4f4f4;
              padding: 10px;
              border-radius: 3px;
              word-break: break-all;
              margin: 10px 0;
            }
            .testing-info {
              background: #e8f4fc;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            h2 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <h1>Email Content Preview</h1>
          <div class="container">
            <h2>Email Details</h2>
            <p><strong>To:</strong> ${email}</p>
            <p><strong>Subject:</strong> Verify Your TalentHub Account</p>
            
            <h2>Email Content</h2>
            <div class="email-preview">
              ${emailHTML}
            </div>
            
            <h2>Verification Link</h2>
            <p>This is the verification link that would be included in the email:</p>
            <div class="link-display">${verificationLink}</div>
            
            <div class="testing-info">
              <h3>Testing Instructions</h3>
              <p>For testing without a frontend, you can use our testing endpoint:</p>
              <p><strong>To test through API:</strong> Visit <code>/api/auth/verify-email?token=YOUR_TOKEN</code></p>
              <p><strong>To test with web interface:</strong> Visit <code>/api/email-test/show-verification?token=YOUR_TOKEN</code></p>
              <p>Replace YOUR_TOKEN with the actual token from the email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    res.send(responseHTML);
  } catch (error) {
    logger.error('Error in view-email-content endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating email preview' 
    });
  }
});

export default router;