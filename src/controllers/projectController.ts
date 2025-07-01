// src/controllers/projectController.ts 
import { Response, NextFunction } from 'express';
import { Project } from '@prisma/client'; // Use Prisma types
import prisma from '../models/prisma';
import { AuthenticatedRequest } from '../types/express-custom';

// Simplified auth helper - reusable across controllers
async function getAuthenticatedUser(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new Error('Unauthorized');
  }
  
  const { auth0Id, email } = req.user;
  return prisma.user.upsert({
    where: { authProviderId: auth0Id },
    update: {},
    create: { authProviderId: auth0Id, email }
  });
}

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { name, description } = req.body;
    
    const project = await prisma.project.create({
      data: { name, description, userId: user.id }
    });
    
    return res.status(201).json(project);
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const getAllProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });
    
    return res.status(200).json(projects);
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: user.id }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.status(200).json(project);
  } catch (error) {
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    const { name, description } = req.body;
    
    // Single database call - Prisma will throw if project doesn't exist or user doesn't own it
    try {
      const project = await prisma.project.update({
        where: { 
          id: req.params.id,
          userId: user.id // This ensures ownership check
        },
        data: { name, description }
      });
      
      return res.status(200).json(project);
    } catch (prismaError) {
      const err = prismaError as any;
      // Prisma throws P2025 when record is not found
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }
      throw prismaError;
    }
  } catch (error) {
    const err = error as any; // <-- ADD THIS LINE
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};

export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getAuthenticatedUser(req);
    
    // Single database call
    try {
      await prisma.project.delete({
        where: { 
          id: req.params.id,
          userId: user.id
        }
      });
      
      return res.status(204).send();
    } catch (prismaError) {
      const err = prismaError as any;
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }
      throw prismaError;
    }
  } catch (error) {
    const err = error as any; // <-- ADD THIS LINE
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};