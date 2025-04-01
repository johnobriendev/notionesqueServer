// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

// Define the validation function
const validateProjectDataFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  
  // Project name is required
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }
  
  // Project name should have a reasonable length
  if (name.length > 100) {
    return res.status(400).json({ error: 'Project name is too long (max 100 characters)' });
  }
  
  // If description is provided, it should be a string
  if (req.body.description !== undefined && 
      (typeof req.body.description !== 'string' || req.body.description.length > 500)) {
    return res.status(400).json({ 
      error: 'Project description must be a string (max 500 characters)' 
    });
  }
  
  next();
};

// Export a wrapped version of the function
export const validateProjectData = asyncHandler(validateProjectDataFn);


// Task validation function definition
const validateTaskDataFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, status, priority, position, customFields } = req.body;
  
  // Title is required
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }
  
  // Title should have a reasonable length
  if (title.length > 200) {
    return res.status(400).json({ error: 'Task title is too long (max 200 characters)' });
  }
  
  // If description is provided, it should be a string
  if (req.body.description !== undefined && 
      (typeof req.body.description !== 'string' || req.body.description.length > 2000)) {
    return res.status(400).json({ 
      error: 'Task description must be a string (max 2000 characters)' 
    });
  }
  
  // Validate status if provided
  if (status !== undefined) {
    const validStatuses = ['not started', 'in progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: not started, in progress, completed' 
      });
    }
  }
  
  // Validate priority if provided
  if (priority !== undefined) {
    const validPriorities = ['none', 'low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority. Must be one of: none, low, medium, high, urgent' 
      });
    }
  }
  
  // Validate position if provided
  if (position !== undefined && 
      (typeof position !== 'number' || isNaN(position) || position < 0)) {
    return res.status(400).json({ error: 'Position must be a positive number' });
  }
  
  // Validate customFields if provided
  if (customFields !== undefined) {
    if (typeof customFields !== 'object' || customFields === null) {
      return res.status(400).json({ error: 'Custom fields must be an object' });
    }
    
    // Check if we're not exceeding a reasonable size for JSON data
    const jsonSize = JSON.stringify(customFields).length;
    if (jsonSize > 10000) {
      return res.status(400).json({ error: 'Custom fields data is too large' });
    }
  }
  
  next();
};

// Bulk update validation function
const validateBulkUpdateDataFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ids, update } = req.body;
  
  // Validate ids array
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Task IDs array is required and must not be empty' });
  }
  
  // Validate update object
  if (!update || typeof update !== 'object') {
    return res.status(400).json({ error: 'Update object is required' });
  }
  
  // Ensure at least one valid field is being updated
  const { status, priority } = update;
  
  if (status === undefined && priority === undefined) {
    return res.status(400).json({ 
      error: 'At least one field (status or priority) must be provided for bulk update' 
    });
  }
  
  // Validate status if provided
  if (status !== undefined) {
    const validStatuses = ['not started', 'in progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: not started, in progress, completed' 
      });
    }
  }
  
  // Validate priority if provided
  if (priority !== undefined) {
    const validPriorities = ['none', 'low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        error: 'Invalid priority. Must be one of: none, low, medium, high, urgent' 
      });
    }
  }
  
  next();
};

// Reorder tasks validation function
const validateReorderDataFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { tasks } = req.body;
  
  // Validate tasks array
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Tasks array is required and must not be empty' });
  }
  
  // Check each task item has id and position
  for (const task of tasks) {
    if (!task.id || typeof task.id !== 'string') {
      return res.status(400).json({ error: 'Each task must have a valid id' });
    }
    
    if (typeof task.position !== 'number' || isNaN(task.position) || task.position < 0) {
      return res.status(400).json({ error: 'Each task must have a valid position (non-negative number)' });
    }
  }
  
  next();
};

// Export wrapped versions of the functions
export const validateTaskData = asyncHandler(validateTaskDataFn);
export const validateBulkUpdateData = asyncHandler(validateBulkUpdateDataFn);
export const validateReorderData = asyncHandler(validateReorderDataFn);