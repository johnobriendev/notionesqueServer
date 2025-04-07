// src/services/userService.ts
import prisma from '../models/prisma';
import { User } from '../models/types';

// export const findOrCreateUser = async (auth0Id: string, email: string): Promise<User> => {
//   // Find existing user
//   let user = await prisma.user.findUnique({
//     where: { authProviderId: auth0Id }
//   });

//   // If user doesn't exist, create a new one
//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         authProviderId: auth0Id,
//         email,
//       }
//     });
//   }

//   return user;
// };

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id }
  });
};

// export const getUserByAuth0Id = async (auth0Id: string): Promise<User | null> => {
//   return prisma.user.findUnique({
//     where: { authProviderId: auth0Id }
//   });
// };

export const updateUserProfile = async (
  id: string,
  data: { name?: string; email?: string }
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data
  });
};

export const getUserByAuth0Id = async (auth0Id: string): Promise<User | null> => {
  console.log('Finding user by Auth0 ID:', auth0Id);
  
  try {
    const user = await prisma.user.findUnique({
      where: { authProviderId: auth0Id }
    });
    
    console.log('Database lookup result:', user ? `User found: ${user.id}` : 'No user found');
    return user;
  } catch (error) {
    console.error('Error finding user by Auth0 ID:', error);
    throw error;
  }
};

export const findOrCreateUser = async (auth0Id: string, email: string): Promise<User> => {
  if (!auth0Id) {
    throw new Error('Auth0 ID is required');
  }
  
  if (!email) {
    throw new Error('Email is required');
  }
  
  console.log('Finding or creating user with Auth0 ID:', auth0Id);
  
  // Find existing user
  let user = await prisma.user.findUnique({
    where: { authProviderId: auth0Id }
  });

  console.log('User found?', !!user);
  
  // If user doesn't exist, create a new one
  if (!user) {
    console.log('Creating new user with email:', email);
    try {
      user = await prisma.user.create({
        data: {
          authProviderId: auth0Id,
          email,
        }
      });
      console.log('User created with ID:', user.id);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  return user;
};