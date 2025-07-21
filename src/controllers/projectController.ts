// src/controllers/projectController.ts 
import { Response, NextFunction } from 'express';
//import { Project } from '@prisma/client'; // Use Prisma types
import prisma from '../models/prisma';
import { AuthenticatedRequest } from '../types/express-custom';
import { getAuthenticatedUser } from '../utils/auth';
import { getUserAccessibleProjects } from '../utils/permissions';



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
    
    
    const response = {
      ...project,
      userRole: 'owner',  
      canWrite: true      
    };
   
    return res.status(201).json(response);
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

    // Get all projects user has access to (owned + collaborated)
    const { owned, collaborated } = await getUserAccessibleProjects(user.id);

    // Combine and sort by most recently updated
    const allProjects = [...owned, ...collaborated].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return res.status(200).json(allProjects);
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
    const { id: projectId } = req.params;

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.userId === user.id) {
      return res.status(200).json({ ...project, userRole: 'owner', canWrite: true });
    }

    // Check if user is collaborator
    const collaborator = await prisma.projectCollaborator.findFirst({
      where: { projectId, userId: user.id }
    });

    if (collaborator) {
      return res.status(200).json({
        ...project,
        userRole: collaborator.role,
        canWrite: collaborator.role === 'editor'
      });
    }

    return res.status(403).json({ error: 'Access denied' });
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
    const { id: projectId } = req.params;

    // Check if user can write to this project
    const project = await prisma.project.findFirst({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner
    if (project.userId === user.id) {
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { name, description }
      });
      return res.status(200).json(updatedProject);
    }

    // Check if user is editor
    const collaborator = await prisma.projectCollaborator.findFirst({
      where: { projectId, userId: user.id }
    });

    if (collaborator && collaborator.role === 'editor') {
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { name, description }
      });
      return res.status(200).json(updatedProject);
    }

    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    const err = error as any;
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
    const { id: projectId } = req.params;

    // Only owners can delete projects
    try {
      await prisma.project.delete({
        where: {
          id: projectId,
          userId: user.id // Only owner can delete
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
    const err = error as any;
    if (err.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next(error);
  }
};