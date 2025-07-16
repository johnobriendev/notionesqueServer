// src/utils/auth.ts 
//import { User } from '@prisma/client';
import prisma from '../models/prisma';
import { AuthenticatedRequest } from '../types/express-custom';

export async function getAuthenticatedUser(req: AuthenticatedRequest){
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  
  const { auth0Id, email } = req.user;
  return prisma.user.upsert({
    where: { authProviderId: auth0Id },
    update: {},
    create: { authProviderId: auth0Id, email }
  });
}