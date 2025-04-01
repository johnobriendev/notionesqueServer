// src/models/types.ts
export interface User {
    id: string;
    email: string;
    name: string | null;
    authProviderId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    position: number;
    projectId: string;
    customFields: any | null;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Define possible statuses and priorities to match your frontend types
  export type TaskStatus = 'not started' | 'in progress' | 'completed';
  
  export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
  
  // Additional types for API requests and responses
  export interface CreateProjectDto {
    name: string;
    description?: string;
  }
  
  export interface UpdateProjectDto {
    name?: string;
    description?: string;
  }
  
  export interface CreateTaskDto {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    position: number;
    customFields: any;
  }
  
  export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    position?: number;
    customFields: any;
  }
  
  export interface BulkUpdateTasksDto {
    ids: string[];
    update: {
      status?: TaskStatus;
      priority?: TaskPriority;
    };
  }
  
  export interface ReorderTasksDto {
    tasks: {
      id: string;
      position: number;
    }[];
  }