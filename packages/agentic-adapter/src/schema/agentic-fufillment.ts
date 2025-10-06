import { z } from 'zod';

export const agenticFufillmentOptionSchema = z.object({
  /**
   * The ID of the fufillment.
   */
  id: z.string(),

  /**
   * The type of the fufillment.
   */
  type: z.enum(['shipping', 'digital']),

  /**
   * The price of the fufillment.
   */
  title: z.string(),

  /**
   * The subtitle of the fufillment.
   */
  subtitle: z.string().nullable().optional(),

  /**
   * The subtotal of the fufillment.
   */
  subtotal: z.number().nullable().optional(),

  /**
   * The tax of the fufillment.
   */
  tax: z.number(),

  /**
   * The total of the fufillment.
   */
  total: z.number(),

  /**
   * The carrier of the fufillment.
   */
  carrier: z.string().nullable().optional(),

  /**
   * The earliest date the fufillment can be delivered.
   */
  earliest_delivery_time: z.string().nullable().optional(),

  /**
   * The latest date the fufillment can be delivered.
   */
  latest_delivery_time: z.string().nullable().optional(),
});

export type AgenticFufillmentOption = z.infer<typeof agenticFufillmentOptionSchema>;
