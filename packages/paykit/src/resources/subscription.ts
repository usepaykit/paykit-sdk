import { z } from 'zod';
import { metadataSchema, PaykitMetadata } from './metadata';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired';

export interface Subscription {
  /**
   * The ID of the subscription.
   */
  id: string;
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
