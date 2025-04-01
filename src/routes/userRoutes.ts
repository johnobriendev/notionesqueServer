// src/routes/userRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import * as userController from '../controllers/userController';
import { asyncHandler } from '../utils/asyncHandler';


const router = Router();

// Get current user
router.get(
  '/me',
  checkJwt,
  extractUserInfo,
  asyncHandler(userController.getCurrentUser)
);

// Update user profile
router.patch(
  '/me',
  checkJwt,
  extractUserInfo,
  asyncHandler(userController.updateUser)
);

export default router;