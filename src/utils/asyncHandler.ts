// // src/utils/asyncHandler.ts
// import { Request, Response, NextFunction } from 'express';

// // This utility helps TypeScript understand async Express middlewares
// export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(fn(req, res, next)).catch(next);
//   };
// };


// src/utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

// This utility helps TypeScript understand Express middlewares (both sync and async)
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = fn(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
};