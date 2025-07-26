// src/types/express-custom.ts
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  auth?: any;
  user?: {
    auth0Id: string;
    email: string;
  };
}

export type AuthenticatedController = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;