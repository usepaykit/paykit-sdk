import { z } from 'zod';
import { metadataSchema, PaykitMetadata } from './metadata';

export const checkoutSessionTypeSchema = z.enum(['one_time', 'recurring']);

export type CheckoutSessionType = z.infer<typeof checkoutSessionTypeSchema>;

export const createCheckoutSchema = z.object({
  /**
   * The ID of the customer.
   */
  customer_id: z.string(),

  /**
   * The metadata of the checkout.
   */
  metadata: metadataSchema,

  /**
   * The mode of the checkout.
   */
  session_type: checkoutSessionTypeSchema,

  /**
   * The item ID of the checkout.
   */
  item_id: z.string(),

  /**
   * Extra information to be sent to the provider e.g tax, trial days, etc.
   */
  provider_metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateCheckoutParams = z.infer<typeof createCheckoutSchema>;

export const retrieveCheckoutSchema = z.object({
  id: z.string(),
});

export type RetrieveCheckoutParams = z.infer<typeof retrieveCheckoutSchema>;

export type Checkout = {
  /**
   * The ID of the checkout.
   */
  id: string;

  /**
   * The ID of the customer.
   */
  customer_id: string;

  /**
   * The payment URL where customer completes the transaction.
   */
  payment_url: string;

  /**
   * The metadata of the checkout.
   */
  metadata: PaykitMetadata | null;

  /**
   * The mode of the checkout.
   */
  session_type: CheckoutSessionType;

  /**
   * The products of the checkout.
   */
  products: Array<{ id: string; quantity: number }>;

  /**
   * The currency code (ISO 4217).
   */
  currency: string;

  /**
   * Total amount in the smallest currency unit (e.g., cents).
   */
  amount: number;
};
