import { Request, Response, NextFunction } from 'express';
import { BorrowService } from '../services/borrowService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CustomError } from '../middlewares/errorHandler';

export const borrowBook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isbn } = req.body;
    const userId = req.user?.id;

    const borrowRecord = await BorrowService.borrowBook(userId, isbn);
    
    res.status(200).json({
      success: true,
      data: borrowRecord
    });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { borrowed_book_id } = req.body;
    const userId = req.user?.id;

    const result = await BorrowService.returnBook(userId, borrowed_book_id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};