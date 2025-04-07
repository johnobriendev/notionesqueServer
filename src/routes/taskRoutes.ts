// src/routes/taskRoutes.ts (update this part)
import { Router } from 'express';
import { checkJwt, extractUserInfo } from '../middleware/auth';
import * as taskController from '../controllers/taskController';
import { 
  validateTaskData, 
  validateBulkUpdateData, 
  validateReorderData 
} from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';

//const router = Router();

// Use mergeParams to access projectId from parent router
const router = Router({ mergeParams: true });

// All task routes require authentication
router.use(checkJwt, extractUserInfo);

// Routes for specific project tasks
router.get('/', asyncHandler(taskController.getTasksByProject));
router.post('/', validateTaskData, asyncHandler(taskController.createTask));


// Routes for individual tasks
router.get('/:taskId', asyncHandler(taskController.getTaskById));
router.patch('/:taskId', validateTaskData, asyncHandler(taskController.updateTask));
router.delete('/:taskId', asyncHandler(taskController.deleteTask));

// Bulk operations
router.post('/bulk', validateBulkUpdateData, asyncHandler(taskController.bulkUpdateTasks));
router.post('/reorder', validateReorderData, asyncHandler(taskController.reorderTasks));
//router.delete('/', asyncHandler(taskController.deleteMultipleTasks));

export default router;