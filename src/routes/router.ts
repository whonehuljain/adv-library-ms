import { Router } from 'express';
import { auth as authRoutes } from './auth'


import bookRoutes from './books';

// import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
// import { registerSchema, loginSchema } from '../schemas/auth.schema';

const router = Router();

//ping
router.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() }).status(200);
});


router.use('/auth', authRoutes);
router.use('/books', bookRoutes);

export default router;