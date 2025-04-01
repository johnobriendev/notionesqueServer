// src/controllers/projectController.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express-custom';
import * as projectService from '../services/projectService';
import { withAuthUser } from '../utils/controllerHelpers';

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    return await withAuthUser(req, res, async (user) => {
      const project = await projectService.createProject(user.id, req.body);
      return res.status(201).json(project);
    });
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
    return await withAuthUser(req, res, async (user) => {
      const projects = await projectService.getAllProjects(user.id);
      return res.status(200).json(projects);
    });
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
    return await withAuthUser(req, res, async (user) => {
      const project = await projectService.getProjectById(req.params.id, user.id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      return res.status(200).json(project);
    });
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
    return await withAuthUser(req, res, async (user) => {
      const project = await projectService.updateProject(req.params.id, user.id, req.body);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }
      
      return res.status(200).json(project);
    });
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
    return await withAuthUser(req, res, async (user) => {
      const project = await projectService.deleteProject(req.params.id, user.id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found or unauthorized' });
      }
      
      return res.status(204).send();
    });
  } catch (error) {
    next(error);
  }
};