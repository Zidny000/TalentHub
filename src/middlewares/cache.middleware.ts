import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string; // Prefix for the cache key
}

/**
 * Middleware that caches the response data
 * @param options Cache options
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const ttl = options.ttl || 300; // Default to 5 minutes
  const keyPrefix = options.keyPrefix || 'cache';

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `${keyPrefix}:${req.originalUrl}`;
    
    try {
      // Try to get from cache
      const cachedData = await CacheService.get<any>(cacheKey);
      
      if (cachedData) {
        // Send cached response
        return res.status(200).json(cachedData);
      }

      // Store original send method
      const originalSend = res.send;
      
      // Override the send method to cache the response
      res.send = function(body: any): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Parse the body to JSON if it's a string
          let data = body;
          if (typeof body === 'string') {
            try {
              data = JSON.parse(body);
            } catch (e) {
              // Not JSON, keep as is
            }
          }
          
          // Store in cache
          CacheService.set(cacheKey, data, ttl).catch(err => {
            console.error('Error caching response:', err);
          });
        }
        
        // Call the original send method
        return originalSend.call(this, body);
      };
      
      next();
    } catch (error) {
      // If there's an error with caching, just continue without caching
      console.error('Cache middleware error:', error);
      next();
    }
  };
};