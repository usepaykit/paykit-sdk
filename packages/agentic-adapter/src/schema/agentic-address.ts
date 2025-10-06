import { z } from 'zod';

export const agenticAddressSchema = z.object({
  /**
   * The first name of the buyer.
   */
  name: z.string(),

  /**
   * The line 1 of the address.
   */
  line_one: z.string(),

  /**
   * The line 2 of the address.
   */
  line_two: z.string(),

  /**
   * The city of the address.
   */
  city: z.string(),

  /**
   * The state of the address.
   */
  state: z.string(),

  /**
   * The country of the address.
   */
  country: z.string(),

  /**
   * The postal code of the address.
   */
  postal_code: z.string(),
});
