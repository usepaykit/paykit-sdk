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

export const toPaykitSubscriptionStatus = <T extends string>(status: T): SubscriptionStatus => {
  if (['active', 'trialing'].includes(status)) return 'active';
  if (['incomplete_expired', 'incomplete', 'past_due'].includes(status)) return 'past_due';
  if (['canceled'].includes(status)) return 'canceled';
  if (['expired'].includes(status)) return 'expired';
  throw new Error(`Unknown status: ${status}`);
};
