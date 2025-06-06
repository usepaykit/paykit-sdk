import { Checkout, Customer, Subscription, toPaykitSubscriptionStatus } from '@paykit-sdk/core/src/resources';
import Stripe from 'stripe';

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
    status: toPaykitSubscriptionStatus<Stripe.Subscription.Status>(subscription.status),
    current_period_start: new Date(subscription.start_date),
    current_period_end: new Date(subscription.cancel_at!),
  };
};
