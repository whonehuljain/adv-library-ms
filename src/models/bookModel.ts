import { z } from 'zod';

export const createBookModel = z.object({
  isbn: z.string().length(13),
  title: z.string().min(1),
  copies: z.number().int().positive(),
  authors: z.array(z.string().uuid()),
  categories: z.array(z.string().uuid())
});

export const updateBookModel = createBookModel.partial();

export const searchBookModel = z.object({
  isbn: z.string().optional(),
  title: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  available: z.boolean().optional()
});