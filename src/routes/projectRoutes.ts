// src/routes/projectRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import * as projectController from '../controllers/projectController';
import { validateProjectData } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All project routes require authentication
router.use(checkJwt, extractUserInfo);

// GET all projects
router.get('/', asyncHandler(projectController.getAllProjects));

// GET a single project
router.get('/:id', asyncHandler(projectController.getProjectById));

// CREATE a new project
router.post('/', 
  validateProjectData,  // Now it's pre-wrapped and TypeScript compatible
  asyncHandler(projectController.createProject)
);

// UPDATE a project
router.patch('/:id', 
  validateProjectData,  // Now it's pre-wrapped and TypeScript compatible
  asyncHandler(projectController.updateProject)
);

// DELETE a project
router.delete('/:id', asyncHandler(projectController.deleteProject));

export default router;