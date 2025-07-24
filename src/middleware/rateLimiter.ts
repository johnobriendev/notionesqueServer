// src/middleware/rateLimiter.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express-custom';

type RateLimitMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;


// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 15 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired rate limit entries`);
  }
}, 15 * 60 * 1000); // Run every 15 minutes

// Generic rate limiter factory
function createRateLimit(windowMs: number, maxRequests: number, keyPrefix: string, message: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // All routes require auth, so req.user should always exist
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userKey = `${keyPrefix}:${req.user.email}`;
    const now = Date.now();

    const userLimit = rateLimitStore.get(userKey);

    if (!userLimit || now > userLimit.resetTime) {
      // First request or window expired - reset the counter
      rateLimitStore.set(userKey, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      // Log rate limit violation for monitoring
      console.warn(`Rate limit exceeded for ${req.user.email} on ${keyPrefix}. Count: ${userLimit.count}, Limit: ${maxRequests}`);
      
      return res.status(429).json({ 
        error: message,
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    // Increment count
    userLimit.count++;
    next();
  };
}


// Different rate limiters for different operations

// Project operations rate limit
export const projectRateLimit: RateLimitMiddleware = createRateLimit(
  60 * 1000, // 1 minute
  30, // 30 requests per minute
  'project',
  'Too many project requests. Please slow down.'
);

// Task operations rate limit (higher limit since tasks are used frequently in Kanban)
export const taskRateLimit: RateLimitMiddleware = createRateLimit(
  60 * 1000, // 1 minute
  50, // 50 requests per minute
  'task',
  'Too many task operations. Please slow down.'
);

// Bulk operations rate limit - for expensive operations like bulk updates
export const bulkOperationRateLimit: RateLimitMiddleware = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  20, // 20 bulk operations per 5 minutes
  'bulk',
  'Too many bulk operations. Please wait before trying again.'
);

// Keep your existing invite rate limiter but enhance it
export const inviteRateLimit: RateLimitMiddleware = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 invites per 15 minutes
  'invite',
  'Too many invitations sent. Please try again later.'
);

// Team/collaboration operations rate limit
export const teamRateLimit: RateLimitMiddleware = createRateLimit(
  60 * 1000, // 1 minute
  20, // 20 requests per minute
  'team',
  'Too many team operations. Please slow down.'
);