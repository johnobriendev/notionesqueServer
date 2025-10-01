// src/routes/projectRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import { projectRateLimit } from '../middleware/rateLimiter';
import * as projectController from '../controllers/projectController';
import { validateProjectData } from '../middleware/validation';
import taskRoutes from './taskRoutes';
import commentRoutes from './commentRoutes';

const router = Router();

router.use(checkJwt, extractUserInfo);
router.use(projectRateLimit);

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', validateProjectData, projectController.createProject);
router.patch('/:id', validateProjectData, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Nest task routes under projects
router.use('/:projectId/tasks', taskRoutes);

// Nest comment routes under tasks
router.use('/:projectId/tasks/:taskId/comments', commentRoutes);

export default router;