const fs = require('fs');
const path = require('path');

// Generate a unique ID for Postman items
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Base URL for API requests
const baseUrl = 'http://localhost:3000';

// Collection template
const collection = {
  info: {
    name: 'TalentHub API',
    description: 'API collection for TalentHub authentication workflows',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    _postman_id: generateUUID()
  },
  item: [],
  event: [],
  variable: []
};

// Authentication folder
const authFolder = {
  name: 'Authentication',
  description: 'API endpoints for user authentication',
  item: [
    // Register endpoint
    {
      name: 'Register',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'securePassword123!'
          }, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        },
        url: {
          raw: `${baseUrl}/api/auth/register`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'auth', 'register']
        },
        description: 'Register a new user'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // Verify Email endpoint
    {
      name: 'Verify Email',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `${baseUrl}/api/auth/verify-email?token={{emailToken}}`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'auth', 'verify-email'],
          query: [
            {
              key: 'token',
              value: '{{emailToken}}'
            }
          ]
        },
        description: 'Verify user email with token'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // Login endpoint
    {
      name: 'Login',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: 'john@example.com',
            password: 'securePassword123!'
          }, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        },
        url: {
          raw: `${baseUrl}/api/auth/login`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'auth', 'login']
        },
        description: 'Login with email and password'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // Verify 2FA endpoint
    {
      name: 'Verify 2FA',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: 'john@example.com',
            code: '123456'
          }, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        },
        url: {
          raw: `${baseUrl}/api/auth/verify-2fa`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'auth', 'verify-2fa']
        },
        description: 'Verify 2FA code'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // Refresh Token endpoint
    {
      name: 'Refresh Token',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            refreshToken: '{{refreshToken}}'
          }, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        },
        url: {
          raw: `${baseUrl}/api/auth/refresh`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'auth', 'refresh']
        },
        description: 'Refresh access token'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // Logout endpoint
    {
      name: 'Logout',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            refreshToken: '{{refreshToken}}'
          }, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        },
        url: {
          raw: `${baseUrl}/api/auth/logout`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'auth', 'logout']
        },
        description: 'Logout user (revoke refresh token)'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // Logout All endpoint
    {
      name: 'Logout All Devices',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          },
          {
            key: 'Authorization',
            value: 'Bearer {{accessToken}}'
          }
        ],
        url: {
          raw: `${baseUrl}/api/auth/logout-all`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'auth', 'logout-all']
        },
        description: 'Logout from all devices'
      },
      response: [],
      _postman_id: generateUUID()
    }
  ],
  _postman_id: generateUUID()
};

// Email Testing folder
const emailTestFolder = {
  name: 'Email Testing',
  description: 'API endpoints for testing email functionality',
  item: [
    // Show verification page endpoint
    {
      name: 'Show Email Verification Page',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `${baseUrl}/api/email-test/show-verification?token={{emailToken}}`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'email-test', 'show-verification'],
          query: [
            {
              key: 'token',
              value: '{{emailToken}}'
            }
          ]
        },
        description: 'Show email verification page (for testing)'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // Process verification endpoint
    {
      name: 'Process Email Verification',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: `${baseUrl}/api/email-test/process-verification?token={{emailToken}}`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'email-test', 'process-verification'],
          query: [
            {
              key: 'token',
              value: '{{emailToken}}'
            }
          ]
        },
        description: 'Process email verification (for testing)'
      },
      response: [],
      _postman_id: generateUUID()
    },
    
    // View email content endpoint
    {
      name: 'View Email Content',
      request: {
        method: 'POST',
        header: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: 'test@example.com'
          }, null, 2),
          options: {
            raw: {
              language: 'json'
            }
          }
        },
        url: {
          raw: `${baseUrl}/api/email-test/view-email-content`,
          protocol: 'http',
          host: ['localhost'],
          port: '3000',
          path: ['api', 'email-test', 'view-email-content']
        },
        description: 'View email content without sending (for testing)'
      },
      response: [],
      _postman_id: generateUUID()
    }
  ],
  _postman_id: generateUUID()
};

// Add folders to collection
collection.item.push(authFolder, emailTestFolder);

// Add collection variables
collection.variable.push(
  {
    key: 'accessToken',
    value: '',
    type: 'string',
    description: 'Access token received after login or 2FA verification'
  },
  {
    key: 'refreshToken',
    value: '',
    type: 'string',
    description: 'Refresh token received after login or 2FA verification'
  },
  {
    key: 'emailToken',
    value: '',
    type: 'string',
    description: 'Token received in verification email'
  }
);

// Write the collection to a file
const outputPath = path.join(__dirname, '..', 'postman_collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

console.log(`Postman collection generated at: ${outputPath}`);