import { PaykitMetadata } from '../types';

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

export type UpdateSubscriptionParams = {
  /**
   * The metadata of the subscription.
   */
  metadata: PaykitMetadata;
};
