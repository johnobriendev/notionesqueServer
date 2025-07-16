// src/routes/index.ts
import { Router } from 'express';
import userRoutes from './userRoutes';
import projectRoutes from './projectRoutes';
import taskRoutes from './taskRoutes';
import teamRoutes from './teamRoutes'


const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// User routes
router.use('/users', userRoutes);

// Project routes
router.use('/projects', projectRoutes);

// Team collaboration routes
router.use('/team', teamRoutes);

// Task routes
//task routes are now under projects
//router.use('/tasks', taskRoutes);

export default router;