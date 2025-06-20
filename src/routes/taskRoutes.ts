// src/routes/taskRoutes.ts
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import * as taskController from '../controllers/taskController';
import { 
  validateTaskData, 
  validateBulkUpdateData, 
  validateReorderData 
} from '../middleware/validation';

const router = Router({ mergeParams: true });

// Apply auth middleware to all routes
router.use(checkJwt, extractUserInfo);

// Project task routes - cast each controller function
router.get('/', taskController.getTasksByProject as any);
router.post('/', validateTaskData, taskController.createTask as any);

// Individual task routes
router.get('/:taskId', taskController.getTaskById as any);
router.patch('/:taskId', validateTaskData, taskController.updateTask as any);
router.patch('/:taskId/priority', taskController.updateTaskPriority as any);
router.delete('/:taskId', taskController.deleteTask as any);

// Bulk operations
router.put('/bulk', validateBulkUpdateData, taskController.bulkUpdateTasks as any);
router.put('/reorder', validateReorderData, taskController.reorderTasks as any);
router.delete('/', taskController.deleteMultipleTasks as any);

export default router;