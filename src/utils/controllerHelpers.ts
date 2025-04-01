// src/utils/controllerHelpers.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express-custom';
import * as userService from '../services/userService';
import { User } from '../models/types';

// Helper that handles the auth check and returns early if user not found
export async function withAuthUser<T>(
  req: AuthenticatedRequest,
  res: Response,
  callback: (user: User) => Promise<T>
): Promise<T | void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { auth0Id } = req.user;
  const user = await userService.getUserByAuth0Id(auth0Id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  return callback(user);
}