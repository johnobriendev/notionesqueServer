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

const router = Router();

// All task routes require authentication
router.use(checkJwt, extractUserInfo);

// Routes for specific project tasks
router.get('/project/:projectId', asyncHandler(taskController.getTasksByProject));
router.post('/project/:projectId', 
  validateTaskData, // No longer calling as a function
  asyncHandler(taskController.createTask)
);
router.post('/project/:projectId/reorder', 
  validateReorderData, // No longer calling as a function
  asyncHandler(taskController.reorderTasks)
);

// Routes for individual tasks
router.get('/:id', asyncHandler(taskController.getTaskById));
router.patch('/:id', 
  validateTaskData, // No longer calling as a function
  asyncHandler(taskController.updateTask)
);
router.delete('/:id', asyncHandler(taskController.deleteTask));

// Bulk operations
router.post('/bulk-update', 
  validateBulkUpdateData, // No longer calling as a function
  asyncHandler(taskController.bulkUpdateTasks)
);

export default router;