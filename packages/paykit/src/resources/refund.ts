import { z } from 'zod';
import { schema } from '../tools';
import { metadataSchema, PaykitMetadata } from './metadata';

export type RefundReason = string | null;

const refundReasonSchema = schema<RefundReason>()(z.string().nullable());

export interface Refund {
  /**
   * The ID of the refund.
   */
  id: string;

  /**
   * The amount refunded.
   */
  amount: number;

  /**
   * The currency of the refund.
   */
  currency: string;

  /**
   * The reason for the refund.
   */
  reason: RefundReason;

  /**
   * The metadata of the refund.
   */
  metadata: PaykitMetadata | null;
}

export const refundSchema = schema<Refund>()(
  z.object({
    id: z.string(),
    amount: z.number(),
    currency: z.string(),
    reason: refundReasonSchema,
    metadata: metadataSchema.nullable(),
  }),
);

export interface CreateRefundSchema
  extends Pick<Refund, 'amount' | 'reason' | 'metadata'> {
  /**
   * The unique identifier of the payment.
   */
  payment_id: string;

  /**
   * The provider metadata of the refund.
   */
  provider_metadata?: Record<string, unknown>;
}

export const createRefundSchema = schema<CreateRefundSchema>()(
  z.object({
    payment_id: z.string(),
    reason: refundReasonSchema,
    amount: z.number().min(0),
    provider_metadata: z.record(z.string(), z.unknown()).optional(),
    metadata: metadataSchema.nullable(),
  }),
);
