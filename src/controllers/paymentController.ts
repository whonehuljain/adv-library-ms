import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getPendingFines = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const pendingFines = await PaymentService.getUserPendingFines(userId);
    
    res.status(200).json({
      success: true,
      data: pendingFines
    });
  } catch (error) {
    next(error);
  }
};

export const payFine = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { fine_id, payment_method } = req.body;

    const result = await PaymentService.processPayment(
      userId, 
      fine_id, 
      payment_method
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const payments = await PaymentService.getPaymentHistory(userId);
    
    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};
