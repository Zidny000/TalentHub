# Testing with Postman

This guide explains how to use the auto-generated Postman collection to test the TalentHub API.

## Generating the Postman Collection

You have two options for generating the Postman collection:

### Option 1: Generate from Actual Routes (Recommended)

This option automatically scans your route files and creates a collection based on the actual endpoints:

```
npm run postman-from-routes
```

**Benefits:**
- Always in sync with your actual code
- Updates automatically when you add new routes
- Smart detection of request bodies and authentication needs

### Option 2: Use the Static Collection

For a manually curated collection:

```
npm run generate-postman
```

Both commands create a `postman_collection.json` file in the root directory of the project.

## Importing into Postman

1. Open Postman
2. Click on "Import" in the top left corner
3. Select "File" > "Upload Files" and choose the `postman_collection.json` file
4. Click "Import" to add the collection to your workspace

## Collection Structure

The collection is organized into folders:

### Authentication
- Register
- Verify Email
- Login
- Verify 2FA
- Refresh Token
- Logout
- Logout All Devices

### Email Testing
- Show Email Verification Page
- Process Email Verification
- View Email Content

## Using Collection Variables

The collection includes predefined variables to manage authentication tokens:

- `{{accessToken}}`: Store your access token here after login
- `{{refreshToken}}`: Store your refresh token here after login
- `{{emailToken}}`: Store your email verification token here

### Setting Variables

After a successful login request, you'll receive access and refresh tokens in the response. To use these tokens in subsequent requests:

1. In the login response, look for `accessToken` and `refreshToken` values
2. In Postman, click on the "eye" icon in the top right to view the current variables
3. Click "Edit" to update the variable values with your tokens
4. Click "Update" to save the changes

## Testing Authentication Flow

### Complete Authentication Flow:

1. **Register a User**
   - Send the Register request with user details
   - Save the verification token from the email (manually or from logs)

2. **Verify Email**
   - Set the `{{emailToken}}` variable with your token
   - Send the Verify Email request

3. **Login**
   - Send the Login request with credentials
   - Save the returned access and refresh tokens to variables

4. **Use Protected Resources**
   - Requests that require authentication will automatically use the tokens

5. **Refresh Token**
   - When the access token expires, use the Refresh Token request
   - Update the `{{accessToken}}` variable with the new token

6. **Logout**
   - Send the Logout request to invalidate the current session

## Testing Email Verification Without Frontend

For testing email verification without a frontend:

1. **View Email Content**
   - Send the View Email Content request with your email address
   - You'll see the email template and verification links

2. **Show Verification Page**
   - Set the `{{emailToken}}` variable with your token
   - Send the Show Email Verification Page request
   - This displays a test page with verification details

3. **Process Verification**
   - Send the Process Email Verification request
   - This simulates clicking the verification link in an email

## Environment Setup

For testing different environments (development, staging, production):

1. Create environment configurations in Postman
2. Set the base URL variable for each environment
3. Switch environments when needed

## Troubleshooting

- If authentication fails, check that your tokens are correctly set in the variables
- For expired tokens, run the refresh token request
- If email verification fails, ensure the token is valid and not expired