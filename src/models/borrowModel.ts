import { z } from 'zod';

export const borrowBookModel = z.object({
  isbn: z.string().length(13),
});

export const returnBookModel = z.object({
  borrowed_book_id: z.string().uuid(),
});