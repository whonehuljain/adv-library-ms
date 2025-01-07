import { Router } from 'express';
import { auth as authRoutes } from './auth'

import { validate } from '../middlewares/validate';

const router = Router();

// Health check route
router.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() }).status(200);
});


router.use('/auth', authRoutes);


export default router;