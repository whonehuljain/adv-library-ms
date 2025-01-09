import { Router } from 'express';
import { auth as authRoutes } from './auth'


import bookRoutes from './books';
import userRoutes from './users';
import borrowRoutes from './borrow';
import paymentRoutes from './payment';
import analyticsRoutes from './analytics';

const router = Router();

//ping
router.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() }).status(200);
});


router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/users', userRoutes);
router.use('/borrow', borrowRoutes);
router.use('/payment', paymentRoutes);
router.use('/analytics', analyticsRoutes);

export default router;