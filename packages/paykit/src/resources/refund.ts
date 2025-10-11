import { z } from 'zod';
import { metadataSchema } from './metadata';

const refundReasonSchema = z.string().nullable().optional();

export const createRefundSchema = z.object({
  /**
   * The ID of the payment.
   */
  payment_id: z.string(),

  /**
   * The reason for the refund.
   */
  reason: refundReasonSchema,

  /**
   * The amount of the refund.
   */
  amount: z.number().min(0),

  /**
   * The provider metadata of the refund.
   */
  provider_metadata: z.record(z.string(), z.unknown()).optional(),

  /**
   * The metadata of the refund.
   */
  metadata: metadataSchema.optional().nullable(),
});

export type CreateRefundSchema = z.infer<typeof createRefundSchema>;

export const refundSchema = z.object({
  /**
   * The ID of the refund.
   */
  id: z.string(),

  /**
   * The amount of the refund.
   */
  amount: z.number(),

  /**
   * The currency of the refund.
   */
  currency: z.string(),

  /**
   * The reason for the refund.
   */
  reason: refundReasonSchema,

  /**
   * The metadata of the refund.
   */
  metadata: metadataSchema.optional().nullable(),
});

export type Refund = z.infer<typeof refundSchema>;
