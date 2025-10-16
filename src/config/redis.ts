import Redis from 'ioredis';
import logger from '../utils/logger';

let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export const initializeRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl);
    
    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (error: Error) => {
      logger.error('Redis connection error:', error);
    });

  } catch (error) {
    logger.error('Error initializing Redis:', error);
    throw error;
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export default {
  initializeRedis,
  closeRedis,
  getRedisClient
};