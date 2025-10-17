import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'TalentHub API',
    version: '1.0.0',
    description: 'API documentation for TalentHub authentication workflows',
    license: {
      name: 'ISC',
    },
    contact: {
      name: 'Zidny Talukdar',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://talenthub-api.onrender.com' 
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' 
        ? 'Production server' 
        : 'Development server',
    },
    {
      url: 'https://talenthub-api.onrender.com',
      description: 'Production server on Render',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  // Path to the API docs files and schema definitions
  apis: [
    './src/docs/swagger/*.js', // External documentation files
    './src/routes/*.ts'        // Keep routes in case you want to add inline comments
  ],
};

export default swaggerJSDoc(options);