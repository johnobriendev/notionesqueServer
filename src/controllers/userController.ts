// src/controllers/userController.ts 
import { Response, NextFunction } from 'express';
import { User } from '@prisma/client'; 
import prisma from '../models/prisma';
import { AuthenticatedRequest } from '../types/express-custom';

async function getOrCreateUser(auth0Id: string, email: string): Promise<User> {
  return prisma.user.upsert({
    where: { authProviderId: auth0Id },
    update: {}, 
    create: {
      authProviderId: auth0Id,
      email,
    }
  });
}

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
    const user = await getOrCreateUser(auth0Id, email);
    
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
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { auth0Id, email } = req.user;
    const { name } = req.body;
    
    // Get user first, then update
    const user = await getOrCreateUser(auth0Id, email);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name }
    });
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};