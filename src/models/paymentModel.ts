import { z } from 'zod';

export const payFineModel = z.object({
  fine_id: z.string().uuid(),
  payment_method: z.enum(['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'])
});