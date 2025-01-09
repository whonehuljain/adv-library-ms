import { Router } from 'express';
import { validate, validateParams } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { 
  getUserProfile, 
  getBorrowedBooks, 
  getUserFines, 
  toggleUserStatus,
  getAllUsers,
  getUserDetailsByAdmin 
} from '../controllers/userController';

import { userIdModel, filterUsersModel, toggleStatusModel } from '../models/userModel';

const router = Router();

//admin routes for user management
router.get('/:userId/details', 
    authenticate, 
    authorize('ADMIN'),
    validateParams(userIdModel), 
    getUserDetailsByAdmin
  );
  
router.get('/', 
    authenticate, 
    authorize('ADMIN'),
    validateParams(filterUsersModel), 
    getAllUsers
);
  
router.patch('/:userId/toggle-status', 
    authenticate, 
    authorize('ADMIN'),
    validateParams(toggleStatusModel), 
    toggleUserStatus
);


//for all
router.get('/profile', authenticate, getUserProfile);

router.get('/borrowed-books', authenticate, getBorrowedBooks);

router.get('/fines', authenticate, getUserFines);

export default router;