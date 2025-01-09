import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { AnalyticsService } from '../services/analyticsService';

export const getMostBorrowedBooks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;
    
    const stats = await AnalyticsService.getMostBorrowedBooks(startDate, endDate);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { month } = req.query;
    const targetMonth = month ? new Date(month as string) : undefined;
    
    const report = await AnalyticsService.getMonthlyReport(targetMonth);
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const getYearlyTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const trends = await AnalyticsService.getYearlyTrends();
    
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};