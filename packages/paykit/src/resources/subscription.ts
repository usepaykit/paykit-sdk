import { z } from 'zod';
import { metadataSchema, PaykitMetadata } from './metadata';

export const subscriptionBillingIntervalSchema = z.enum(['month', 'year']);

export type SubscriptionBillingInterval = z.infer<typeof subscriptionBillingIntervalSchema>;

export const subscriptionStatusSchema = z.enum(['active', 'past_due', 'canceled', 'expired']);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export interface Subscription {
  /**
   * The ID of the subscription.
   */
  id: string;

  /**
   * The amount in smallest currency unit.
   */
  amount: number;

  /**
   * The currency of the subscription.
   */
  currency: string;

  /**
   * The ID of the customer.
   */
  customer_id: string;

  /**
   * The status of the subscription.
   */
  status: SubscriptionStatus;

  /**
   * The current period start of the subscription.
   */
  current_period_start: Date;

  /**
   * The current period end of the subscription.
   */
  current_period_end: Date;

  /**
   * The ID of the item.
   */
  item_id: string;

  /**
   * The billing interval of the subscription.
   */
  billing_interval: SubscriptionBillingInterval;

  /**
   * The billing interval count of the subscription.
   */
  billing_interval_count: number;

  /**
   * The checkout ID of the subscription.
   */
  checkout_id: string | null;

  /**
   * The metadata of the subscription.
   */
  metadata: PaykitMetadata;
}

export const updateSubscriptionSchema = z.object({
  metadata: metadataSchema.optional(),
});

export type UpdateSubscriptionParams = z.infer<typeof updateSubscriptionSchema>;

export const retrieveSubscriptionSchema = z.object({
  id: z.string(),
});

export type RetrieveSubscriptionParams = z.infer<typeof retrieveSubscriptionSchema>;
