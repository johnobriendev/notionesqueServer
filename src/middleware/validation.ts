// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

// Define the validation function
const validateProjectDataFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  
  // Project name is required
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }
  
  // Project name should have a reasonable length
  if (name.length > 100) {
    return res.status(400).json({ error: 'Project name is too long (max 100 characters)' });
  }
  
  // If description is provided, it should be a string
  if (req.body.description !== undefined && 
      (typeof req.body.description !== 'string' || req.body.description.length > 500)) {
    return res.status(400).json({ 
      error: 'Project description must be a string (max 500 characters)' 
    });
  }
  
  next();
};

// Export a wrapped version of the function
export const validateProjectData = asyncHandler(validateProjectDataFn);