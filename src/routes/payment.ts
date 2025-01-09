import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { payFineModel } from '../models/paymentModel';
import { 
  getPendingFines,
  payFine,
  getPaymentHistory
} from '../controllers/paymentController';

const router = Router();

router.get('/fines/pending',
  authenticate,
  getPendingFines
);

router.post('/fines/pay',
  authenticate,
  validate(payFineModel),
  payFine
);

router.get('/history',
  authenticate,
  getPaymentHistory
);

export default router;