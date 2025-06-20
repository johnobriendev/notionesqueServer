// src/routes/projectRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import * as projectController from '../controllers/projectController';
import { validateProjectData } from '../middleware/validation';
import taskRoutes from './taskRoutes';

const router = Router();

router.use(checkJwt, extractUserInfo);

router.get('/', projectController.getAllProjects as any);
router.get('/:id', projectController.getProjectById as any);
router.post('/', validateProjectData, projectController.createProject as any);
router.patch('/:id', validateProjectData, projectController.updateProject as any);
router.delete('/:id', projectController.deleteProject as any);

// Nest task routes under projects
router.use('/:projectId/tasks', taskRoutes);

export default router;