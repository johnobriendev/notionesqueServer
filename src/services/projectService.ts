// src/services/projectService.ts
import prisma from '../models/prisma';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/types';

export const createProject = async (userId: string, data: CreateProjectDto): Promise<Project> => {
  return prisma.project.create({
    data: {
      ...data,
      userId
    }
  });
};

export const getProjectById = async (id: string, userId: string): Promise<Project | null> => {
  return prisma.project.findFirst({
    where: {
      id,
      userId // Ensure the project belongs to the requesting user
    }
  });
};

export const getAllProjects = async (userId: string): Promise<Project[]> => {
  return prisma.project.findMany({
    where: {
      userId
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
};

export const updateProject = async (
  id: string, 
  userId: string, 
  data: UpdateProjectDto
): Promise<Project | null> => {
  // First check if the project exists and belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!project) {
    return null;
  }

  return prisma.project.update({
    where: { id },
    data
  });
};

export const deleteProject = async (
  id: string, 
  userId: string
): Promise<Project | null> => {
  // First check if the project exists and belongs to the user
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!project) {
    return null;
  }

  return prisma.project.delete({
    where: { id }
  });
};