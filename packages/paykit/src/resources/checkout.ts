import { z } from 'zod';
import { metadataSchema, PaykitMetadata } from './metadata';
import { subscriptionBillingIntervalSchema } from './subscription';

export const checkoutSubscriptionSchema = z.object({
  /**
   * The billing interval.
   */
  billing_interval: subscriptionBillingIntervalSchema,

  /**
   * The billing interval count.
   */
  billing_interval_count: z.number(),
});

export type CheckoutSubscription = z.infer<typeof checkoutSubscriptionSchema>;

export const billingModeSchema = z.enum(['one_time', 'recurring']);

export type BillingMode = z.infer<typeof billingModeSchema>;

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
  session_type: billingModeSchema,

  /**
   * The item ID of the checkout.
   */
  item_id: z.string(),

  /**
   * The quantity of the item.
   */
  quantity: z.number(),

  /**
   * The subscription specification of the checkout.
   */
  subscription: checkoutSubscriptionSchema.optional(),

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
  session_type: BillingMode;

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

  /**
   * The date the checkout expires.
   */
  expires_at: string | null;

  /**
   * The subscription specification of the checkout.
   */
  subscription?: CheckoutSubscription | null;
};
