import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
};