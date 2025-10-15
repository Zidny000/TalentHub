const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run the route analyzer first
console.log('Analyzing routes...');
execSync('npm run analyze-routes', { stdio: 'inherit' });

// Path to the route analysis output
const routesPath = path.join(__dirname, '..', 'api-routes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

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

// Group routes by file/module
const routeGroups = routes.reduce((groups, route) => {
  const group = route.file.split('.')[0]; // Remove file extension
  
  // Create folder name from file name
  let folderName = group.replace(/-routes$|\.routes$/, '');
  folderName = folderName.charAt(0).toUpperCase() + folderName.slice(1);
  
  if (!groups[folderName]) {
    groups[folderName] = [];
  }
  groups[folderName].push(route);
  return groups;
}, {});

// Create a folder for each group
Object.keys(routeGroups).forEach(folderName => {
  const folder = {
    name: folderName,
    description: `API endpoints for ${folderName.toLowerCase()}`,
    item: [],
    _postman_id: generateUUID()
  };
  
  // Add each route as an item in the folder
  routeGroups[folderName].forEach(route => {
    // Create a more readable name from the path
    const parts = route.path.split('/').filter(p => p);
    const lastPart = parts[parts.length - 1];
    let name = lastPart.replace(/-/g, ' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    name = `${route.method} ${name}`;
    
    // Determine if this requires auth token
    const requiresAuth = route.path.includes('logout-all');
    
    // Determine if this is a query-based route
    const isQueryBased = route.method === 'GET' && 
                        (route.path.includes('verify-email') || 
                         route.path.includes('verification'));
    
    // Default request body based on route
    let requestBody = {};
    
    if (route.path.includes('register')) {
      requestBody = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123!'
      };
    } else if (route.path.includes('login')) {
      requestBody = {
        email: 'john@example.com',
        password: 'securePassword123!'
      };
    } else if (route.path.includes('verify-2fa')) {
      requestBody = {
        email: 'john@example.com',
        code: '123456'
      };
    } else if (route.path.includes('refresh') || route.path.includes('logout')) {
      requestBody = {
        refreshToken: '{{refreshToken}}'
      };
    } else if (route.path.includes('view-email-content')) {
      requestBody = {
        email: 'test@example.com'
      };
    }
    
    // Build the request URL
    let urlObj = {
      raw: `${baseUrl}${route.fullPath}`,
      protocol: 'http',
      host: ['localhost'],
      port: '3000',
      path: route.fullPath.split('/').filter(p => p)
    };
    
    // Add query params for GET requests that need a token
    if (isQueryBased) {
      urlObj.query = [
        {
          key: 'token',
          value: '{{emailToken}}'
        }
      ];
      urlObj.raw += '?token={{emailToken}}';
    }
    
    // Create request object
    const request = {
      method: route.method,
      header: [
        {
          key: 'Content-Type',
          value: 'application/json'
        }
      ],
      url: urlObj,
      description: `${route.method} request to ${route.fullPath}`
    };
    
    // Add authorization header if needed
    if (requiresAuth) {
      request.header.push({
        key: 'Authorization',
        value: 'Bearer {{accessToken}}'
      });
    }
    
    // Add request body for non-GET requests
    if (route.method !== 'GET' && Object.keys(requestBody).length > 0) {
      request.body = {
        mode: 'raw',
        raw: JSON.stringify(requestBody, null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      };
    }
    
    // Create the item
    const item = {
      name,
      request,
      response: [],
      _postman_id: generateUUID()
    };
    
    folder.item.push(item);
  });
  
  collection.item.push(folder);
});

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

console.log(`\nPostman collection generated at: ${outputPath}`);
console.log('Collection built from actual routes in your application');
console.log('You can now import this file into Postman to test your API');