import { z } from 'zod';
import { schema } from '../tools';
import { Payee, payeeSchema } from './customer';
import { metadataSchema, PaykitMetadata } from './metadata';
import { ShippingInfo, shippingInfoSchema } from './shipping';

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

export interface Payment {
  /**
   * The unique identifier of the payment.
   */
  id: string;

  /**
   * The amount of the payment.
   */
  amount: number;

  /**
   * The currency of the payment.
   */
  currency: string;

  /**
   * The payee of the payment.
   */
  customer: Payee;

  /**
   * The status of the payment.
   */
  status: PaymentStatus;

  /**
   * The metadata of the payment.
   */
  metadata: PaykitMetadata;

  /**
   * The product ID of the payment.
   */
  product_id: string | null;
}

export const paymentSchema = schema<Payment>()(
  z.object({
    id: z.string(),
    amount: z.number().min(0),
    currency: z.string(),
    customer: payeeSchema,
    status: paymentStatusSchema,
    metadata: metadataSchema,
    product_id: z.string().nullable(),
  }),
);

export interface CreatePaymentSchema extends Omit<Payment, 'id' | 'status'> {
  /**
   * The provider specific params of the payment.
   */
  provider_metadata?: Record<string, unknown>;

  /**
   * The shipping info of the payment.
   */
  shipping_info?: ShippingInfo;
}

export const createPaymentSchema = schema<CreatePaymentSchema>()(
  paymentSchema
    .omit({ id: true, status: true })
    .extend({ provider_metadata: z.record(z.string(), z.unknown()).optional(), shipping_info: shippingInfoSchema.optional() }),
);

export interface UpdatePaymentSchema extends Partial<Omit<Payment, 'id' | 'status'>> {
  provider_metadata?: Record<string, unknown>;
}

export const updatePaymentSchema = schema<UpdatePaymentSchema>()(
  paymentSchema.partial().extend({ provider_metadata: z.record(z.string(), z.unknown()).optional() }),
);

export interface RetrievePaymentSchema {
  /**
   * The unique identifier of the payment.
   */
  id: string;
}

export const retrievePaymentSchema = schema<RetrievePaymentSchema>()(paymentSchema.pick({ id: true }));

export interface DeletePaymentSchema {
  /**
   * The unique identifier of the payment.
   */
  id: string;
}

export const deletePaymentSchema = schema<DeletePaymentSchema>()(paymentSchema.pick({ id: true }));

export interface CapturePaymentSchema {
  /**
   * The amount to capture.
   */
  amount: number;
}

export const capturePaymentSchema = schema<CapturePaymentSchema>()(
  z.object({
    amount: z.number(),
  }),
);
