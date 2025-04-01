// src/types/express-custom.ts
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  auth?: any;
  user?: {
    auth0Id: string;
    email: string;
  };
}