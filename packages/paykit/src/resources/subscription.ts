import { z } from 'zod';
import { metadataSchema, PaykitMetadata } from './metadata';

export const subscriptionBillingIntervalSchema = z.enum(['day', 'week', 'month', 'year']);

export type SubscriptionBillingInterval = z.infer<typeof subscriptionBillingIntervalSchema>;

export const subscriptionStatusSchema = z.enum(['active', 'past_due', 'canceled', 'expired']);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export interface Subscription {
  /**
   * The ID for the subscription.
   */
  id: string;

  /**
   * Customer ID linked to the subscription.
   */
  customer_id: string;

  /**
   * Amount in smallest currency unit (e.g., cents).
   */
  amount: number;

  /**
   * ISO 4217 currency code (e.g., USD, EUR).
   */
  currency: string;

  /**
   * Subscription status.
   */
  status: SubscriptionStatus;

  /**
   * Start of the current billing period (ISO 8601 string).
   */
  current_period_start: Date;

  /**
   * End of the current billing period (ISO 8601 string).
   */
  current_period_end: Date;

  /**
   * Current billing cycle number (e.g., 3 for third month of a monthly sub).
   */
  current_cycle: number;

  /**
   * Total completed billing cycles (computed dynamically from provider invoices).
   */
  total_cycles: number;

  /**
   * Product/item ID being subscribed to.
   */
  item_id: string;

  /**
   * Billing interval (e.g., day, week, month, year).
   */
  billing_interval: SubscriptionBillingInterval;

  /**
   * Number of intervals per billing cycle (e.g., 3 for quarterly).
   */
  billing_interval_count: number;

  /**
   * Metadata for provider-specific or custom data.
   */
  metadata: PaykitMetadata | null;
}

export const updateSubscriptionSchema = z.object({
  metadata: metadataSchema.optional(),
});

export type UpdateSubscriptionParams = z.infer<typeof updateSubscriptionSchema>;

export const retrieveSubscriptionSchema = z.object({
  id: z.string(),
});

export type RetrieveSubscriptionParams = z.infer<typeof retrieveSubscriptionSchema>;
