// src/utils/controllerHelpers.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express-custom';
import * as userService from '../services/userService';

export async function getUserFromRequest(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return { error: 'Unauthorized', status: 401, user: null };
  }

  const { auth0Id } = req.user;
  const user = await userService.getUserByAuth0Id(auth0Id);

  if (!user) {
    return { error: 'User not found', status: 404, user: null };
  }

  return { error: null, status: 200, user };
}