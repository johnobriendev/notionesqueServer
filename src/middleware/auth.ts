// src/middleware/auth.ts
import { Response, NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { AUTH0_DOMAIN, AUTH0_AUDIENCE } from '../config/env';
import { AuthenticatedRequest } from '../types/express-custom';


console.log('Backend Auth0 Configuration:');
console.log('- Domain:', AUTH0_DOMAIN);
console.log('- Audience:', AUTH0_AUDIENCE);

export const checkJwt = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

export const extractUserInfo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    //console.log('extractUserInfo called - Request path:', req.path);
    
    if (!req.auth) {
      //console.log('No auth information in request - checkJwt middleware might have failed');
      next();
      return;
    }

    //console.log('Auth payload:', JSON.stringify(req.auth.payload, null, 2));
    
    const auth0Id = req.auth.payload.sub;
    //console.log('Auth0 ID:', auth0Id);


    
    // Try multiple sources for email
    // 1. Standard claim
    // 2. Custom header
    // 3. Namespaced claim
    let email = req.auth.payload.email;
    //console.log('Email from token:', email);
    
    if (!email && req.headers['x-user-email']) {
      email = req.headers['x-user-email'] as string;
      //console.log('Using email from custom header:', email);
    }
    
    if (!email && req.auth.payload[`${AUTH0_AUDIENCE}/email`]) {
      email = req.auth.payload[`${AUTH0_AUDIENCE}/email`] as string;
      //console.log('Using email from namespaced claim:', email);
    }
    
    if (!auth0Id) {
      //console.log('Missing auth0Id');
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
    
    // If we still don't have an email, use a derived one as fallback
    if (!email) {
      email = `${auth0Id.replace('|', '_')}@example.com`;
      //console.log('Using derived email as fallback:', email);
    }

    req.user = {
      auth0Id,
      email
    };
    
    //console.log('User info set in request:', req.user);
    next();
  } catch (error) {
    //console.error('Error in extractUserInfo middleware:', error);
    next(error);
  }
};