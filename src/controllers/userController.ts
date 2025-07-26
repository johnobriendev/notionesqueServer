// src/controllers/userController.ts 
import { Response, NextFunction } from 'express';
//import { User } from '@prisma/client'; 
import prisma from '../models/prisma';
import { AuthenticatedRequest, AuthenticatedController } from '../types/express-custom';

async function getOrCreateUser(auth0Id: string, email: string){
  return prisma.user.upsert({
    where: { authProviderId: auth0Id },
    update: {}, 
    create: {
      authProviderId: auth0Id,
      email,
    }
  });
}

export const getCurrentUser: AuthenticatedController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { auth0Id, email } = req.user;
    const user = await getOrCreateUser(auth0Id, email);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser: AuthenticatedController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { auth0Id, email } = req.user;
    const { name } = req.body;
    
    // Get user first, then update
    const user = await getOrCreateUser(auth0Id, email);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name }
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
