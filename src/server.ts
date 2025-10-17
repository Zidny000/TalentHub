import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import http from 'http';
import app from './app';
import { initializeDatabase, closeDatabase } from './config/dataSource';
import { initializeRedis, closeRedis } from './config/redis';
import logger from './utils/logger';
import websocketService from './services/websocket.service';
import { createAdminUser } from './utils/createAdmin';

const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Create admin user if it doesn't exist
    await createAdminUser();
    
    // Initialize Redis connection
    await initializeRedis();
    
    // Create HTTP server
    const httpServer = http.createServer(app);
    
    // Initialize WebSocket service
    websocketService.initialize(httpServer);
    
    // Start the server
    const server = httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`WebSocket server is ready for connections`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        logger.info('HTTP server closed');
        await closeDatabase();
        await closeRedis();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();