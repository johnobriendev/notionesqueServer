// src/middleware/auth.ts
import { Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { AUTH0_DOMAIN, AUTH0_AUDIENCE } from '../config/env';
import { AuthenticatedRequest } from '../types/express-custom';

export const checkJwt = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

export const extractUserInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth) {
      return next();
    }

    const auth0Id = req.auth.payload.sub;
    const email = req.auth.payload[`${AUTH0_AUDIENCE}/email`] || req.auth.payload.email;
    
    req.user = {
      auth0Id,
      email
    };
    
    next();
  } catch (error) {
    next(error);
  }
};