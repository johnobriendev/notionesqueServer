// src/controllers/taskController.ts - STREAMLINED VERSION
import { Response, NextFunction } from 'express';
import { Task } from '@prisma/client';
import prisma from '../models/prisma';
import { AuthenticatedRequest } from '../types/express-custom';
import { getAuthenticatedUser } from '../utils/auth';

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
    const { title, description, status = 'not started', priority = 'none', position, customFields } = req.body;
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        position,
        customFields,
        project: {
          connect: { id: projectId, userId: user.id } // Ensures project ownership
        }
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
    
    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        project: { userId: user.id } // Ensures project ownership
      },
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
      where: {
        id: taskId,
        project: { userId: user.id }
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
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
    const { title, description, status, priority, position, customFields } = req.body;
    
    try {
      const task = await prisma.task.update({
        where: {
          id: taskId,
          project: { userId: user.id }
        },
        data: { title, description, status, priority, position, customFields }
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
    
    try {
      await prisma.task.delete({
        where: {
          id: taskId,
          project: { userId: user.id }
        }
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
    
    // Single updateMany operation with ownership check
    const result = await prisma.task.updateMany({
      where: {
        id: { in: taskIds },
        project: { userId: user.id }
      },
      data: updates
    });
    
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
    
    // Use transaction for atomic updates
    const updatedTasks = await prisma.$transaction(
      tasks.map((task: { id: string; position: number }) =>
        prisma.task.update({
          where: {
            id: task.id,
            projectId,
            project: { userId: user.id }
          },
          data: { position: task.position }
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
    
    const result = await prisma.task.deleteMany({
      where: {
        id: { in: taskIds },
        projectId,
        project: { userId: user.id }
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
    const { priority, destinationIndex } = req.body;
    
    try {
      const task = await prisma.task.update({
        where: {
          id: taskId,
          project: { userId: user.id }
        },
        data: {
          priority,
          ...(destinationIndex !== undefined && { position: destinationIndex })
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