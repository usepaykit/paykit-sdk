import { z } from 'zod';
import { metadataSchema } from './metadata';

export const subscriptionBillingIntervalSchema = z.enum(['day', 'week', 'month', 'year']);

export type SubscriptionBillingInterval = z.infer<typeof subscriptionBillingIntervalSchema>;

export const subscriptionStatusSchema = z.enum(['active', 'past_due', 'canceled', 'expired']);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const subscriptionSchema = z.object({
  /**
   * The ID for the subscription.
   */
  id: z.string(),

  /**
   * Customer ID linked to the subscription.
   */
  customer_id: z.string(),

  /**
   * Amount in smallest currency unit (e.g., cents).
   */
  amount: z.number(),

  /**
   * ISO 4217 currency code (e.g., USD, EUR).
   */
  currency: z.string(),

  /**
   * Subscription status.
   */
  status: subscriptionStatusSchema,

  /**
   * Start of the current billing period (ISO 8601 string).
   */
  current_period_start: z.date(),

  /**
   * End of the current billing period (ISO 8601 string).
   */
  current_period_end: z.date(),

  /**
   * Current billing cycle number (e.g., 3 for third month of a monthly sub).
   */
  current_cycle: z.number(),

  /**
   * Total completed billing cycles (computed dynamically from provider invoices).
   */
  total_cycles: z.number(),

  /**
   * Product being subscribed to.
   */
  item_id: z.string(),

  /**
   * Billing interval (e.g., day, week, month, year).
   */
  billing_interval: subscriptionBillingIntervalSchema,

  /**
   * Number of intervals per billing cycle (e.g., 3 for quarterly).
   */
  billing_interval_count: z.number(),

  /**
   * Metadata of the subscription.
   */
  metadata: metadataSchema.nullable().optional(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export const updateSubscriptionSchema = z.object({
  metadata: metadataSchema.optional(),
});

export type UpdateSubscriptionParams = z.infer<typeof updateSubscriptionSchema>;

export const retrieveSubscriptionSchema = z.object({
  id: z.string(),
});

export type RetrieveSubscriptionParams = z.infer<typeof retrieveSubscriptionSchema>;
