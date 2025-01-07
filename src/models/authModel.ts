import { z } from 'zod';

export const registerModel = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
});

export const loginModel = z.object({
  email: z.string().email(),
  password: z.string()
});