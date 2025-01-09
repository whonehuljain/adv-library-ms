import { z } from 'zod';

export const userIdModel = z.object({
  userId: z.string().uuid('Invalid user ID format')
});


export const filterUsersModel = z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional()
});


export const toggleStatusModel = z.object({
  userId: z.string().uuid('Invalid user ID')
});
