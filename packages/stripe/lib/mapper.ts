import { Checkout, Customer, Invoice, stringifyObjectValues, Subscription, SubscriptionStatus } from '@paykit-sdk/core';
import Stripe from 'stripe';

/**
 * @internal
 */
export const toPaykitCheckout = (checkout: Stripe.Checkout.Session): Checkout => {
  return {
    id: checkout.id,
    customer_id: checkout.customer as string,
    session_type: checkout.mode === 'subscription' ? 'recurring' : 'one_time', // todo: handle `setup` mode
    payment_url: checkout.url!,
    products: checkout.line_items!.data.map(item => ({ id: item.price!.id, quantity: item.quantity! })),
    currency: checkout.currency!,
    amount: checkout.amount_total!,
    metadata: checkout.metadata,
  };
};

/**
 * @internal
 */
export const toPaykitCustomer = (customer: Stripe.Customer): Customer => {
  return {
    id: customer.id,
    email: customer.email ?? undefined,
    name: customer.name ?? undefined,
    metadata: stringifyObjectValues(customer.metadata ?? {}),
  };
};

export const toPaykitSubscriptionStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  if (['active', 'trialing'].includes(status)) return 'active';
  if (['incomplete_expired', 'incomplete', 'past_due'].includes(status)) return 'past_due';
  if (['canceled'].includes(status)) return 'canceled';
  if (['expired'].includes(status)) return 'expired';
  throw new Error(`Unknown status: ${status}`);
};

/**
 * @internal
 */
export const toPaykitSubscription = (subscription: Stripe.Subscription): Subscription => {
  return {
    id: subscription.id,
    customer_id: subscription.customer?.toString(),
    status: toPaykitSubscriptionStatus(subscription.status),
    current_period_start: new Date(subscription.start_date),
    current_period_end: new Date(subscription.cancel_at!),
    metadata: stringifyObjectValues(subscription.metadata ?? {}),
  };
};

export const toPaykitInvoice = (invoice: Stripe.Invoice): Invoice => {
  return {
    id: invoice.id!,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    metadata: stringifyObjectValues(invoice.metadata ?? {}),
    customer_id: invoice.customer?.toString() ?? '',
  };
};
