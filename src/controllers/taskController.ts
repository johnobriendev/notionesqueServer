// src/controllers/taskController.ts 
import { Response, NextFunction } from 'express';
//import { Task } from '@prisma/client';
import prisma from '../models/prisma';
import { AuthenticatedRequest } from '../types/express-custom';
import { getAuthenticatedUser } from '../utils/auth';
import { validateProjectAccess } from '../utils/permissions';


// Helper to handle Prisma not found errors
const handlePrismaError = (error: any, res: Response) => {
  const err = error as any;
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found or unauthorized' });
  }
  throw error;
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { projectId } = req.params;
    const { id, title, description, status = 'not started', priority = 'none', position, customFields } = req.body;
    
    // Check if user can write to this project
    const access = await validateProjectAccess(user.id, projectId, 'write');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    const task = await prisma.task.create({
      data: {
        ...(id && { id }),
        title,
        description,
        status,
        priority,
        position,
        customFields,
        projectId,
        version: 1,
        updatedBy: user.email
      }
    });
    
    return res.status(201).json(task);
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    next(error);
  }
};

export const getTasksByProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { projectId } = req.params;
    
    // Check if user can read this project
    const access = await validateProjectAccess(user.id, projectId, 'read');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { position: 'asc' }
    });
    
    return res.status(200).json(tasks);
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const getTaskById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { taskId } = req.params;
    
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: { project: true }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user can read this project
    const access = await validateProjectAccess(user.id, task.projectId, 'read');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    return res.status(200).json(task);
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { taskId } = req.params;
    const { title, description, status, priority, position, customFields, version } = req.body;
    
    // Get current task
    const currentTask = await prisma.task.findFirst({
      where: { id: taskId },
      include: { project: true }
    });
    
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user can write to this project
    const access = await validateProjectAccess(user.id, currentTask.projectId, 'write');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    // Simple version conflict check
      if (version && currentTask.version !== version) {
      return res.status(409).json({
        error: 'VERSION_CONFLICT',
        message: `This task was modified by ${currentTask.updatedBy || 'another user'} while you were editing it.`,
        conflict: {
          taskId: currentTask.id,
          expectedVersion: version,
          currentVersion: currentTask.version,
          lastUpdatedBy: currentTask.updatedBy,
          lastUpdatedAt: currentTask.updatedAt,
          currentTask: currentTask
        }
      });
    }
    
    try {
      const task = await prisma.task.update({
        where: { id: taskId },
        data: { 
          title, 
          description, 
          status, 
          priority, 
          position, 
          customFields,
          version: { increment: 1 },
          updatedBy: user.email
        }
      });
      
      return res.status(200).json(task);
    } catch (prismaError) {
      return handlePrismaError(prismaError, res);
    }
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { taskId } = req.params;
    
    // Get current task
    const currentTask = await prisma.task.findFirst({
      where: { id: taskId }
    });
    
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user can write to this project
    const access = await validateProjectAccess(user.id, currentTask.projectId, 'write');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    try {
      await prisma.task.delete({
        where: { id: taskId }
      });
      
      return res.status(204).send();
    } catch (prismaError) {
      return handlePrismaError(prismaError, res);
    }
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const bulkUpdateTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { taskIds, updates } = req.body;
    
    // Get project ID from first task to check permissions
    const firstTask = await prisma.task.findFirst({
      where: { id: taskIds[0] }
    });
    
    if (!firstTask) {
      return res.status(404).json({ error: 'Tasks not found' });
    }
    
    // Check if user can write to this project
    const access = await validateProjectAccess(user.id, firstTask.projectId, 'write');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    // Update all tasks
    const result = await prisma.task.updateMany({
      where: {
        id: { in: taskIds },
        projectId: firstTask.projectId
      },
      data: {
        ...updates,
        updatedBy: user.email
      }
    });
    
    // Update versions separately (updateMany doesn't support increment)
    await prisma.$transaction(
      taskIds.map((taskId: string) =>
        prisma.task.update({
          where: { id: taskId },
          data: { version: { increment: 1 } }
        })
      )
    );
    
    if (result.count === 0) {
      return res.status(404).json({ error: 'No tasks found or unauthorized' });
    }
    
    return res.status(200).json({
      message: `Successfully updated ${result.count} tasks`,
      count: result.count
    });
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const reorderTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { projectId } = req.params;
    const { tasks } = req.body;
    
    // Check if user can write to this project
    const access = await validateProjectAccess(user.id, projectId, 'write');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    // Use transaction for atomic updates
    const updatedTasks = await prisma.$transaction(
      tasks.map((task: { id: string; position: number }) =>
        prisma.task.update({
          where: {
            id: task.id,
            projectId
          },
          data: { 
            position: task.position,
            version: { increment: 1 },
            updatedBy: user.email
          }
        })
      )
    );
    
    return res.status(200).json(updatedTasks);
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'One or more tasks not found or unauthorized' });
    }
    next(error);
  }
};

export const deleteMultipleTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { projectId } = req.params;
    const { taskIds } = req.body;
    
    // Check if user can write to this project
    const access = await validateProjectAccess(user.id, projectId, 'write');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    const result = await prisma.task.deleteMany({
      where: {
        id: { in: taskIds },
        projectId
      }
    });
    
    if (result.count === 0) {
      return res.status(404).json({ error: 'No tasks found or unauthorized' });
    }
    
    return res.status(200).json({
      message: `Successfully deleted ${result.count} tasks`,
      count: result.count
    });
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const updateTaskPriority = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { taskId } = req.params;
    const { priority, destinationIndex, version } = req.body;
    
    // Get current task
    const currentTask = await prisma.task.findFirst({
      where: { id: taskId }
    });
    
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user can write to this project
    const access = await validateProjectAccess(user.id, currentTask.projectId, 'write');
    if (!access.success) {
      return res.status(403).json({ error: access.error });
    }
    
    // Simple version conflict check
     if (version && currentTask.version !== version) {
      return res.status(409).json({
        error: 'VERSION_CONFLICT',
        message: `This task was modified by ${currentTask.updatedBy || 'another user'} while you were editing it.`,
        conflict: {
          taskId: currentTask.id,
          expectedVersion: version,
          currentVersion: currentTask.version,
          lastUpdatedBy: currentTask.updatedBy,
          lastUpdatedAt: currentTask.updatedAt,
          currentTask: currentTask
        }
      });
    }
    
    try {
      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          priority,
          ...(destinationIndex !== undefined && { position: destinationIndex }),
          version: { increment: 1 },
          updatedBy: user.email
        }
      });
      
      return res.status(200).json(task);
    } catch (prismaError) {
      return handlePrismaError(prismaError, res);
    }
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};