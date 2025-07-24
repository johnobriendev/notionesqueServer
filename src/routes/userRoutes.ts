// src/routes/userRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import { teamRateLimit } from '../middleware/rateLimiter'; 
import * as userController from '../controllers/userController';

const router = Router();

router.use(checkJwt, extractUserInfo);
router.use(teamRateLimit as any);

router.get('/me', userController.getCurrentUser as any);
router.patch('/me', userController.updateUser as any);

export default router;