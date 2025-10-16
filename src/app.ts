import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import logger from './utils/logger';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import path from 'path';

// Create Express application
const app: Application = express();

// Special route for Stripe webhooks (needs raw body)
app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api', routes);

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Default route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to TalentHub API' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', err);

  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetails = null;

  // Handle operational errors (custom AppError instances)
  if (err.isOperational) {
    statusCode = err.statusCode || 500;
    message = err.message;
    errorDetails = err.errorDetails;
  } else if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation error occurred.';
    errorDetails = err.errors;
  } else if (err.name === 'CastError') {
    // Mongoose cast error
    statusCode = 400;
    message = 'Invalid data format';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 400;
    message = 'Duplicate value error';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT errors
    statusCode = 401;
    message = 'Authentication failed';
  }

  // Send error response
  const errorResponse: any = {
    success: false,
    message
  };

  // Add error details if available
  if (errorDetails) {
    errorResponse.errorDetails = errorDetails;
  }

  res.status(statusCode).json(errorResponse);
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Resource not found',
    errorDetails: `Route ${req.method} ${req.url} not found`
  });
});

export default app;