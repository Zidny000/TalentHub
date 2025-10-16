import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

/**
 * Cache service for Redis operations
 */
export class CacheService {
  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to store
   * @param expiryInSeconds - Time to live in seconds (optional)
   */
  static async set(key: string, value: any, expiryInSeconds?: number): Promise<void> {
    try {
      const redis = getRedisClient();
      const serializedValue = JSON.stringify(value);
      
      if (expiryInSeconds) {
        await redis.setex(key, expiryInSeconds, serializedValue);
      } else {
        await redis.set(key, serializedValue);
      }
    } catch (error) {
      logger.error(`Error setting cache for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns The cached value or null if not found
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient();
      const value = await redis.get(key);
      
      if (!value) {
        return null;
      }
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Error getting cache for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove a value from the cache
   * @param key - Cache key
   */
  static async delete(key: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(key);
    } catch (error) {
      logger.error(`Error deleting cache for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists in the cache
   * @param key - Cache key
   * @returns True if the key exists, false otherwise
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking cache existence for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set cache with expiry if not exists
   * @param key - Cache key
   * @param value - Value to store
   * @param expiryInSeconds - Time to live in seconds
   * @returns True if key was set, false otherwise (already exists)
   */
  static async setNX(key: string, value: any, expiryInSeconds: number): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const serializedValue = JSON.stringify(value);
      const result = await redis.set(key, serializedValue, 'EX', expiryInSeconds, 'NX');
      return result === 'OK';
    } catch (error) {
      logger.error(`Error setting cache NX for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all keys in the cache
   * WARNING: Use this with caution
   */
  static async clear(): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.flushall();
    } catch (error) {
      logger.error('Error clearing cache:', error);
      throw error;
    }
  }
}