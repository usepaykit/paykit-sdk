import { customerSchema } from '@paykit-sdk/core';
import { z } from 'zod';

export const agenticBuyerSchema = customerSchema.pick({ email: true }).extend({
  /**
   * The ID of the buyer.
   */
  id: z.string(),

  /**
   * The first name of the buyer.
   */
  first_name: z.string(),

  /**
   * The last name of the buyer.
   */
  last_name: z.string(),

  /**
   * The phone number of the buyer.
   */
  phone: z.string(),
});

export type AgenticBuyer = z.infer<typeof agenticBuyerSchema>;
