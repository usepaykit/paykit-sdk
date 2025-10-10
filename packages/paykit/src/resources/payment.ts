import { z } from 'zod';
import { payeeSchema } from './customer';
import { metadataSchema } from './metadata';
import { shippingInfoSchema } from './shipping';

/**
 * @description Payment statuses
 * PENDING - Payment is created but awaiting processing
 * PROCESSING - Payment is being processed by the provider,
 * REQUIRES_ACTION - Requires user action (3DS, bank verification, etc.)
 * REQUIRES_CAPTURE - Authorized, awaiting manual capture
 * SUCCEEDED - Payment completed successfully
 * CANCELED - Payment canceled before completion
 * FAILED - Payment attempt failed
 */
export const paymentStatusSchema = z.enum(['pending', 'processing', 'requires_action', 'requires_capture', 'succeeded', 'canceled', 'failed']);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentSchema = z.object({
  /**
   * The ID of the payment.
   */
  id: z.string(),

  /**
   * The amount of the payment.
   */
  amount: z.number().min(0),

  /**
   * The currency of the payment.
   */
  currency: z.string(),

  /**
   * The payee of the payment.
   */
  customer: payeeSchema,

  /**
   * The status of the payment.
   */
  status: paymentStatusSchema,

  /**
   * The metadata of the payment.
   */
  metadata: metadataSchema,

  /**
   * Id of product for payment.
   */
  product_id: z.string().nullable(),
});

export type Payment = z.infer<typeof paymentSchema>;

export const createPaymentSchema = paymentSchema
  .omit({ id: true, status: true })
  .extend({ provider_metadata: z.record(z.string(), z.unknown()).optional(), shipping_info: shippingInfoSchema.optional() });

export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = paymentSchema.partial().extend({ provider_metadata: z.record(z.string(), z.unknown()).optional() });

export type UpdatePaymentSchema = z.infer<typeof updatePaymentSchema>;
