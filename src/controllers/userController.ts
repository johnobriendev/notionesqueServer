// src/controllers/userController.ts
import { Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { AuthenticatedRequest } from '../types/express-custom';
import { withAuthUser } from '../utils/controllerHelpers';

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { auth0Id, email } = req.user;
    
    const user = await userService.findOrCreateUser(auth0Id, email);
    
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    return await withAuthUser(req, res, async (user) => {
      const { name } = req.body;
      const updatedUser = await userService.updateUserProfile(user.id, { name });
      
      return res.status(200).json(updatedUser);
    });
  } catch (error) {
    next(error);
  }
};