// src/controllers/taskController.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express-custom';
import * as taskService from '../services/taskService';
import * as projectService from '../services/projectService';
import { withAuthUser } from '../utils/controllerHelpers';

// Create a new task
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    
    return await withAuthUser(req, res, async (user) => {
      // Verify project exists and belongs to user
      const project = await projectService.getProjectById(projectId, user.id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }
      
      const task = await taskService.createTask(projectId, req.body);
      return res.status(201).json(task);
    });
  } catch (error) {
    next(error);
  }
};

// Get all tasks for a project
export const getTasksByProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    
    return await withAuthUser(req, res, async (user) => {
      try {
        const tasks = await taskService.getTasksByProject(projectId, user.id);
        return res.status(200).json(tasks);
      } catch (error) {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single task by ID
export const getTaskById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, taskId } = req.params;
    
    return await withAuthUser(req, res, async (user) => {
      const task = await taskService.getTaskById(taskId, user.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }
      
      return res.status(200).json(task);
    });
  } catch (error) {
    next(error);
  }
};

// Update a task
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, taskId } = req.params;
    
    return await withAuthUser(req, res, async (user) => {
      const task = await taskService.updateTask(taskId, user.id, req.body);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }
      
      return res.status(200).json(task);
    });
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, taskId } = req.params;
    
    return await withAuthUser(req, res, async (user) => {
      const task = await taskService.deleteTask(taskId, user.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }
      
      return res.status(204).send();
    });
  } catch (error) {
    next(error);
  }
};

// Bulk update tasks (status, priority)
export const bulkUpdateTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    return await withAuthUser(req, res, async (user) => {
      try {
        const count = await taskService.bulkUpdateTasks(user.id, req.body);
        return res.status(200).json({ 
          message: `Successfully updated ${count} tasks`,
          count
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return res.status(400).json({ error: errorMessage });
      }
    });
  } catch (error) {
    next(error);
  }
};

// Reorder tasks within a project
export const reorderTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    
    return await withAuthUser(req, res, async (user) => {
      try {
        const tasks = await taskService.reorderTasks(projectId, user.id, req.body);
        return res.status(200).json(tasks);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return res.status(400).json({ error: errorMessage });
      }
    });
  } catch (error) {
    next(error);
  }
};


export const deleteMultipleTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const { taskIds } = req.body;
    
    return await withAuthUser(req, res, async (user) => {
      try {
        // Create this method in your taskService if it doesn't exist
        const count = await taskService.deleteMultipleTasks(projectId, user.id, taskIds);
        return res.status(200).json({ 
          message: `Successfully deleted ${count} tasks`,
          count
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return res.status(400).json({ error: errorMessage });
      }
    });
  } catch (error) {
    next(error);
  }
};


// Update task priority
export const updateTaskPriority = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, taskId } = req.params;
    const { priority, destinationIndex } = req.body;
    
    return await withAuthUser(req, res, async (user) => {
      // Create a simpler update object for the service
      const updateData = {
        priority,
        position: destinationIndex // Optional position
      };
      
      const task = await taskService.updateTask(taskId, user.id, updateData);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }
      
      return res.status(200).json(task);
    });
  } catch (error) {
    next(error);
  }
};