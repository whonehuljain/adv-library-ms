import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { CustomError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: any;
}



export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new CustomError('Authentication required');
    }

    console.log('token found, verifying...');

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(new CustomError('Invalid token'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new CustomError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new CustomError('Unauthorized'));
    }

    next();
};
};
