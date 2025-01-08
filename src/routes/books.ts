import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { createBookModel, updateBookModel, searchBookModel } from '../models/bookModel';

const router = Router();
const bookController = new BookController();

//admin only
router.post('/', 
  authenticate, 
  authorize('ADMIN'), 
  validate(createBookModel), 
  bookController.createBook
);

router.put('/:id', 
  authenticate, 
  authorize('ADMIN'), 
  validate(updateBookModel), 
  bookController.updateBook
);

router.delete('/:id', 
  authenticate, 
  authorize('ADMIN'), 
  bookController.deleteBook
);

//for all
router.get('/:id',
  authenticate,
  bookController.getBook);


router.get('/', 
  authenticate, 
  validate(searchBookModel), 
  bookController.searchBooks);

export default router;