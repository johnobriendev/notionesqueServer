// src/services/taskService.ts
import prisma from '../models/prisma';
import { Task, CreateTaskDto, UpdateTaskDto, ReorderTasksDto, BulkUpdateTasksDto } from '../models/types';

// Create a new task
export const createTask = async (projectId: string, data: CreateTaskDto): Promise<Task> => {
  // Verify project exists before creating task
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Create a properly formatted data object for Prisma
  const taskData = {
    title: data.title,
    description: data.description || null,
    status: data.status || 'not started', // Provide default value if undefined
    priority: data.priority || 'none',    // Provide default value if undefined
    position: data.position,
    projectId,
    customFields: data.customFields || null
  };

  return prisma.task.create({
    data: taskData
  });
};

// Get a single task by id (with project ownership check)
export const getTaskById = async (id: string, userId: string): Promise<Task | null> => {
  return prisma.task.findFirst({
    where: {
      id,
      project: {
        userId
      }
    }
  });
};

// Get all tasks for a specific project
export const getTasksByProject = async (projectId: string, userId: string): Promise<Task[]> => {
  // Verify project exists and belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    }
  });

  if (!project) {
    throw new Error('Project not found or unauthorized');
  }

  return prisma.task.findMany({
    where: {
      projectId
    },
    orderBy: {
      position: 'asc'
    }
  });
};

// Update a task
export const updateTask = async (
  id: string,
  userId: string,
  data: UpdateTaskDto
): Promise<Task | null> => {
  // Verify task exists and belongs to a project owned by the user
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        userId
      }
    }
  });

  if (!task) {
    return null;
  }

  // Filter out undefined values to avoid type issues with Prisma
  const updateData: any = {};
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.customFields !== undefined) updateData.customFields = data.customFields;


  return prisma.task.update({
    where: { id },
    data: updateData
  });
};

// Delete a task
export const deleteTask = async (id: string, userId: string): Promise<Task | null> => {
  // Verify task exists and belongs to a project owned by the user
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: {
        userId
      }
    }
  });

  if (!task) {
    return null;
  }

  return prisma.task.delete({
    where: { id }
  });
};

// Bulk update multiple tasks (for status or priority changes)
export const bulkUpdateTasks = async (
  userId: string,
  data: BulkUpdateTasksDto
): Promise<number> => {
  const { taskIds, updates } = data;
  
  // Verify all tasks belong to projects owned by the user
  const tasksToUpdate = await prisma.task.findMany({
    where: {
      id: { in: taskIds },
      project: {
        userId
      }
    }
  });
  
  // If we don't find all tasks, some might not exist or not belong to the user
  if (tasksToUpdate.length !== taskIds.length) {
    throw new Error('One or more tasks not found or unauthorized');
  }

  // Create a clean update object without undefined values
  const updateData: any = {};
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  
  // Perform the update operation
  const updateOperation = await prisma.task.updateMany({
    where: {
      id: { in: taskIds }
    },
    data: updateData
  });
  
  return updateOperation.count;
};

// Reorder tasks
export const reorderTasks = async (
  projectId: string,
  userId: string,
  data: ReorderTasksDto
): Promise<Task[]> => {
  // Verify project exists and belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    }
  });

  if (!project) {
    throw new Error('Project not found or unauthorized');
  }
  
  // Update each task's position in a transaction
  const { tasks } = data;
  
  const updates = tasks.map(item => 
    prisma.task.update({
      where: { id: item.id },
      data: { position: item.position }
    })
  );
  
  return prisma.$transaction(updates);
};


// Delete multiple tasks
export const deleteMultipleTasks = async (
  projectId: string,
  userId: string,
  taskIds: string[]
): Promise<number> => {
  // Verify project exists and belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId
    }
  });

  if (!project) {
    throw new Error('Project not found or unauthorized');
  }
  
  // Verify all tasks belong to the specified project
  const tasksToDelete = await prisma.task.findMany({
    where: {
      id: { in: taskIds },
      projectId
    }
  });
  
  // If we don't find all tasks, some might not exist or not belong to the project
  if (tasksToDelete.length !== taskIds.length) {
    throw new Error('One or more tasks not found or do not belong to this project');
  }
  
  // Delete the tasks
  const deleteOperation = await prisma.task.deleteMany({
    where: {
      id: { in: taskIds },
      projectId
    }
  });
  
  return deleteOperation.count;
};