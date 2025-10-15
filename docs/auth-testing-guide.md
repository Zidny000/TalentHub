# Authentication Workflow Testing Guide

This guide explains how to use the Swagger API documentation and email testing endpoints to test the complete authentication workflow in the TalentHub API.

## Access Swagger Documentation

1. Start your server with `npm run dev`
2. Open your browser and navigate to: `http://localhost:3000/api-docs`

## Authentication Workflow Testing

### 1. User Registration

Use the `/api/auth/register` endpoint to register a new user:

- Navigate to the Authentication section in Swagger UI
- Find the POST `/api/auth/register` endpoint
- Click "Try it out" and provide the required user information:
  ```json
  {
    "name": "Test User",
    "email": "test@example.com",
    "password": "securePassword123!"
  }
  ```
- Click "Execute" to send the request
- The response should include a success message indicating that a verification email has been sent

### 2. Email Verification Testing (Without Frontend)

Since we don't have a frontend server, we've created special email testing endpoints:

#### Option 1: View Email Content Without Sending

- Navigate to the Email Testing section in Swagger UI
- Find the POST `/api/email-test/view-email-content` endpoint
- Click "Try it out" and provide an email address:
  ```json
  {
    "email": "test@example.com"
  }
  ```
- Click "Execute" to send the request
- The response will be an HTML page showing:
  - What the verification email would look like
  - The verification link that would be included
  - Testing instructions for using the API endpoint directly

#### Option 2: Use the Verification Token from a Real Email

After registration, a real email is sent. You can:

1. Check the email sent to the address you provided during registration
2. Copy the verification token from the email link
3. Use one of these methods to verify:
   - Use Swagger UI to execute GET `/api/auth/verify-email` with the token
   - Visit `/api/email-test/show-verification?token=YOUR_TOKEN` in your browser
   - The browser interface provides a user-friendly way to test the verification process

### 3. Login

After verifying your email, you can login:

- Use the POST `/api/auth/login` endpoint
- Provide your credentials:
  ```json
  {
    "email": "test@example.com",
    "password": "securePassword123!"
  }
  ```
- If successful, you will receive access and refresh tokens

### 4. Two-Factor Authentication (if enabled)

If 2FA is enabled for the account:

- Login will return a 202 status with a message that 2FA is required
- An email with a 2FA code will be sent to your email address
- Use the POST `/api/auth/verify-2fa` endpoint with:
  ```json
  {
    "email": "test@example.com",
    "code": "123456"  // Code from the email
  }
  ```

### 5. Token Refresh

To refresh your access token:

- Use the POST `/api/auth/refresh` endpoint with:
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- You'll receive a new access token

### 6. Logout

To logout:

- Use the POST `/api/auth/logout` endpoint with:
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- This invalidates the current refresh token

## Email Testing Flow

1. **Register a new user** → A verification email is sent
2. **Check the email** → It contains two links:
   - A regular verification link (for frontend use)
   - A testing verification link (for API testing without frontend)
3. **Use the testing link** → This opens a web interface showing:
   - The token received
   - A button to verify the email
   - Additional information about verification
4. **Click "Verify Email"** → This processes the verification and shows the result

This approach allows full testing of the authentication flow, including email verification, without requiring a separate frontend application.