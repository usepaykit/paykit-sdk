import { Checkout, Customer, Subscription, toPaykitSubscriptionStatus } from '@paykit-sdk/core/src/resources';
import Stripe from 'stripe';

export const toPaykitCheckout = (checkout: Stripe.Checkout.Session): Checkout => {
  return {
    id: checkout.id,
    customer_id: checkout.customer as string,
    session_type: checkout.mode === 'subscription' ? 'recurring' : 'one_time', // todo: handle `setup` mode
    payment_url: checkout.url!,
    products: checkout.line_items!.data.map(item => ({ id: item.price!.id, quantity: item.quantity! })),
    currency: checkout.currency!,
    amount: checkout.amount_total!,
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
