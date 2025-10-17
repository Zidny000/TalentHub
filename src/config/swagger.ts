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
      url: 'https://talenthub-2mnv.onrender.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
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