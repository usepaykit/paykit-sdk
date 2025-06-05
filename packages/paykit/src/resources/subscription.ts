export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired';

export interface Subscription {
  id: string;
  customer_id: string;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  metadata?: Record<string, string>;
}

export type UpdateSubscriptionParams = {
  metadata: Record<string, string>;
};
