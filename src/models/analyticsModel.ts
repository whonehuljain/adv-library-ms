import { z } from 'zod';

export const dateRangeModel = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
});