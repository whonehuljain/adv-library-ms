import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { dateRangeModel } from '../models/analyticsModel';
import {
  getMostBorrowedBooks,
  getMonthlyReport,
  getYearlyTrends
} from '../controllers/analyticsController';

const router = Router();

//only admin access to analytics routes/APIs
router.use(authenticate, authorize('ADMIN'));

router.get('/books/most-borrowed',
  validate(dateRangeModel),
  getMostBorrowedBooks
);

router.get('/reports/monthly',
  getMonthlyReport
);

router.get('/reports/yearly-trends',
  getYearlyTrends
);

export default router;