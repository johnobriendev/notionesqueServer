// src/middleware/rateLimiter.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express-custom';

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const inviteRateLimit = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userKey = req.user.email;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // 10 invites per 15 minutes

  const userLimit = rateLimitStore.get(userKey);

  if (!userLimit || now > userLimit.resetTime) {
    // First request or window expired
    rateLimitStore.set(userKey, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (userLimit.count >= maxRequests) {
    return res.status(429).json({ 
      error: 'Too many invitations sent. Please try again later.',
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }

  // Increment count
  userLimit.count++;
  next();
};