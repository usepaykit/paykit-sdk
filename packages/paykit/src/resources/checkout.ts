import { z } from 'zod';
import { metadataSchema } from './metadata';
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

export const checkoutSchema = z.object({
  /**
   * The ID of the checkout.
   */
  id: z.string(),

  /**
   * The ID of the customer.
   */
  customer_id: z.string(),

  /**
   * The payment URL of the checkout.
   */
  payment_url: z.string(),

  /**
   * The metadata of the checkout.
   */
  metadata: metadataSchema.nullable().optional(),

  /**
   * The mode of the checkout.
   */
  session_type: billingModeSchema,

  /**
   * The products of the checkout.
   */
  products: z.array(z.object({ id: z.string(), quantity: z.number() })),

  /**
   * The currency code (ISO 4217).
   */
  currency: z.string(),

  /**
   * The amount of the checkout.
   */
  amount: z.number(),

  /**
   * The subscription specification of the checkout.
   */
  subscription: checkoutSubscriptionSchema.nullable().optional(),
});

export type Checkout = z.infer<typeof checkoutSchema>;
