const fs = require('fs');
const path = require('path');

/**
 * Route Analyzer
 * This utility analyzes your route files to extract endpoints and route information.
 * It can help you keep your Postman collection in sync with your actual routes.
 */

// Configuration
const routesDir = path.join(__dirname, '..', 'src', 'routes');
const outputFile = path.join(__dirname, '..', 'api-routes.json');

// Store discovered routes
const routes = [];

/**
 * Extract routes from route files
 */
function analyzeRoutes() {
  // Get all route files
  const routeFiles = fs.readdirSync(routesDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  console.log(`Analyzing ${routeFiles.length} route files...`);

  // Process each file
  routeFiles.forEach(file => {
    const filePath = path.join(routesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const fileRoutes = extractRoutesFromContent(content, file);
    
    routes.push(...fileRoutes);
    console.log(`Found ${fileRoutes.length} routes in ${file}`);
  });

  // Save to output file
  fs.writeFileSync(outputFile, JSON.stringify(routes, null, 2));
  console.log(`\nDiscovered ${routes.length} total routes`);
  console.log(`Route information saved to: ${outputFile}`);
}

/**
 * Extract routes from file content using regex
 */
function extractRoutesFromContent(content, fileName) {
  const fileRoutes = [];
  
  // Common HTTP method pattern
  const methodPattern = /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = methodPattern.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    
    fileRoutes.push({
      method,
      path: path.startsWith('/') ? path : `/${path}`,
      file: fileName,
      fullPath: `/api${path.startsWith('/') ? path : `/${path}`}`
    });
  }
  
  return fileRoutes;
}

// Run the analyzer
analyzeRoutes();