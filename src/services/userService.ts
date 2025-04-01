// src/services/userService.ts
import prisma from '../models/prisma';
import { User } from '../models/types';

export const findOrCreateUser = async (auth0Id: string, email: string): Promise<User> => {
  // Find existing user
  let user = await prisma.user.findUnique({
    where: { authProviderId: auth0Id }
  });

  // If user doesn't exist, create a new one
  if (!user) {
    user = await prisma.user.create({
      data: {
        authProviderId: auth0Id,
        email,
      }
    });
  }

  return user;
};

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id }
  });
};

export const getUserByAuth0Id = async (auth0Id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { authProviderId: auth0Id }
  });
};

export const updateUserProfile = async (
  id: string,
  data: { name?: string; email?: string }
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data
  });
};