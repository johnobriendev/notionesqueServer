// src/routes/index.ts
import { Router } from 'express';
import userRoutes from './userRoutes';
import projectRoutes from './projectRoutes';


const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// User routes
router.use('/users', userRoutes);

// Project routes
router.use('/projects', projectRoutes);

export default router;