// src/controllers/projectController.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express-custom';
import * as projectService from '../services/projectService';
import * as userService from '../services/userService';

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { auth0Id } = req.user;
    const user = await userService.getUserByAuth0Id(auth0Id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await projectService.createProject(user.id, req.body);
    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { auth0Id } = req.user;
    const user = await userService.getUserByAuth0Id(auth0Id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const projects = await projectService.getAllProjects(user.id);
    return res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { auth0Id } = req.user;
    const user = await userService.getUserByAuth0Id(auth0Id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await projectService.getProjectById(req.params.id, user.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { auth0Id } = req.user;
    const user = await userService.getUserByAuth0Id(auth0Id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await projectService.updateProject(req.params.id, user.id, req.body);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    return res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { auth0Id } = req.user;
    const user = await userService.getUserByAuth0Id(auth0Id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await projectService.deleteProject(req.params.id, user.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};