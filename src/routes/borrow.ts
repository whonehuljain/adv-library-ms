import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { borrowBookModel, returnBookModel } from '../models/borrowModel';
import { borrowBook, returnBook } from '../controllers/borrowController';

const router = Router();

router.post('/borrow',
  authenticate,
  validate(borrowBookModel),
  borrowBook
);

router.post('/return',
  authenticate,
  validate(returnBookModel),
  returnBook
);

export default router;