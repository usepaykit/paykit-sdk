import Stripe from 'stripe';
import { Checkout } from '../../paykit/src/resources/checkout';
import { Customer } from '../../paykit/src/resources/customer';
import { Subscription, SubscriptionStatus } from '../../paykit/src/resources/subscription';
import { WebhookEvent, WebhookEventLiteral } from '../../paykit/src/webhook-provider';

export const toPaykitStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  if (['active', 'trialing'].includes(status)) return 'active';
  if (['incomplete_expired', 'incomplete', 'past_due'].includes(status)) return 'past_due';
  if (['canceled'].includes(status)) return 'canceled';
  if (['expired'].includes(status)) return 'expired';
  throw new Error(`Unknown status: ${status}`);
};

export const toPaykitCheckout = (checkout: Stripe.Checkout.Session): Checkout => {
  return {
    id: checkout.id,
    customer_id: checkout.customer as string,
    mode: checkout.mode as 'payment' | 'subscription',
    success_url: checkout.success_url!,
    cancel_url: checkout.cancel_url!,
    products: checkout.line_items!.data.map(item => ({ id: item.price!.id, quantity: item.quantity! })),
    url: checkout.url!,
    ...(checkout.metadata && { metadata: checkout.metadata }),
  };
};

export const toPaykitCustomer = (customer: Stripe.Customer): Customer => {
  return { id: customer.id, email: customer.email ?? undefined, name: customer.name ?? undefined };
};

export const toPaykitSubscription = (subscription: Stripe.Subscription): Subscription => {
  return {
    id: subscription.id,
    customer_id: subscription.customer as string,
    status: toPaykitStatus(subscription.status),
    current_period_start: new Date(subscription.start_date),
    current_period_end: new Date(subscription.cancel_at!),
  };
};

export const toPaykitEvent = <T extends any>(event: { id: string; type: WebhookEventLiteral; created: number; data: T }): WebhookEvent<T> => {
  return event;
};
