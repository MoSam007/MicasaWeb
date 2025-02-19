import { NextFunction } from "express";

export class AppError extends Error {
    constructor(
      public statusCode: number,
      public message: string,
      public isOperational = true
    ) {
      super(message);
      Object.setPrototypeOf(this, AppError.prototype);
    }
  }
  
  export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };