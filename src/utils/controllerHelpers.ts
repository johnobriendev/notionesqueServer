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
  console.log('withAuthUser called - Request path:', req.path);


  if (!req.user) {
    console.log('No user in request - auth middleware likely failed');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { auth0Id, email } = req.user;
  console.log('Looking up user with Auth0 ID:', auth0Id);

  let user = await userService.getUserByAuth0Id(auth0Id);

  if (!user) {
    console.log('User not found in database for Auth0 ID:', auth0Id);
    
    // Try to create the user if not found
    console.log('Attempting to create user with email:', email);
    try {
      // Try to create the user on-the-fly
      const newUser = await userService.findOrCreateUser(auth0Id, email);
      console.log('User created successfully:', newUser.id);
      return callback(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
     res.status(500).json({ error: 'Failed to create user' });
     return;
    }
  }

  console.log('User found in database:', user.id);

  return callback(user);
}