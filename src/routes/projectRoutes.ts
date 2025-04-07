// src/routes/projectRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import * as projectController from '../controllers/projectController';
import { validateProjectData } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';
import taskRoutes from './taskRoutes';

const router = Router();

// All project routes require authentication
router.use(checkJwt, extractUserInfo);

// GET all projects
router.get('/', asyncHandler(projectController.getAllProjects));

// GET a single project
router.get('/:id', asyncHandler(projectController.getProjectById));

// CREATE a new project
router.post('/', validateProjectData, asyncHandler(projectController.createProject));

// UPDATE a project
router.patch('/:id', validateProjectData, asyncHandler(projectController.updateProject));

// DELETE a project
router.delete('/:id', asyncHandler(projectController.deleteProject));

// Nest task routes under projects
router.use('/:projectId/tasks', taskRoutes);

export default router;