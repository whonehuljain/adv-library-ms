import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as userService from '../services/userService';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters = req.query;
        
        // Convert string 'true'/'false' to boolean
        const parsedFilters = {
            ...filters,
            isActive: filters.isActive ? filters.isActive === 'true' : undefined,
            isVerified: filters.isVerified ? filters.isVerified === 'true' : undefined
        };

        const users = await userService.getAllUsers(parsedFilters);
        
        if (users.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No users found matching the criteria'
            });
            return;
        }

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getBorrowedBooks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const borrowedBooks = await userService.getUserBorrowedBooks(userId);
    res.json({ success: true, data: borrowedBooks });
  } catch (error) {
    next(error);
  }
};

export const getUserFines = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const fines = await userService.getUserFines(userId);
    res.json({ success: true, data: fines });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const updatedUser = await userService.toggleUserStatus(userId);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getUserDetailsByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const userDetails = await userService.getUserDetailsByAdmin(userId);
      res.json({ success: true, data: userDetails });
    } catch (error) {
      next(error);
    }
  };