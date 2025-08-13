import {
  BillingMode,
  Checkout,
  Customer,
  Invoice,
  InvoiceStatus,
  PAYKIT_INTERNAL_PREFIX,
  stringifyObjectValues,
  Subscription,
  SubscriptionBillingInterval,
  withoutPaykitMetadata,
} from '@paykit-sdk/core';
import Stripe from 'stripe';

/**
 * @internal
 * Helper functions to map Stripe objects to Paykit objects
 */

export const exchangeCorrTokenForCheckoutId = (token: string) => {
  return token;
};

/**
 * Checkout
 */
export const paykitCheckout$InboundSchema = (checkout: Stripe.Checkout.Session): Checkout => {
  return {
    id: checkout.id,
    customer_id: typeof checkout.customer === 'string' ? checkout.customer.toString() : (checkout.customer?.id ?? ''),
    session_type: checkout.mode === 'subscription' ? 'recurring' : 'one_time',
    payment_url: checkout.url!,
    products: checkout.line_items!.data.map(item => ({ id: item.price!.id, quantity: item.quantity! })),
    currency: checkout.currency!,
    amount: checkout.amount_total!,
    subscription: null,
    expires_at: checkout.expires_at.toString(),
    metadata: withoutPaykitMetadata(stringifyObjectValues(checkout.metadata ?? {})),
  };
};

/**
 * Customer
 */
export const paykitCustomer$InboundSchema = (customer: Stripe.Customer): Customer => {
  return {
    id: customer.id,
    email: customer.email ?? undefined,
    name: customer.name ?? undefined,
    metadata: stringifyObjectValues(customer.metadata ?? {}),
  };
};

/**
 * Subscription
 */
export const paykitSubscription$InboundSchema = (subscription: Stripe.Subscription): Subscription => {
  const checkoutId = JSON.parse(subscription.metadata?.[PAYKIT_INTERNAL_PREFIX] ?? '{}')?.ref?.checkout_id as string;

  const status = (() => {
    if (['active', 'trialing'].includes(subscription.status)) return 'active';
    if (['incomplete_expired', 'incomplete', 'past_due'].includes(subscription.status)) return 'past_due';
    if (['canceled'].includes(subscription.status)) return 'canceled';
    if (['expired'].includes(subscription.status)) return 'expired';
    throw new Error(`Unknown status: ${subscription.status}`);
  })();

  return {
    id: subscription.id,
    status,
    customer_id: subscription.customer?.toString(),
    amount: subscription.items.data[0].price.unit_amount!,
    currency: subscription.items.data[0].price.currency!,
    checkout_id: checkoutId,
    item_id: subscription.items.data[0].id,
    billing_interval: subscription.items.data[0].price.recurring?.interval as SubscriptionBillingInterval,
    billing_interval_count: subscription.items.data[0].price.recurring?.interval_count ?? 1,
    current_period_start: new Date(subscription.start_date),
    current_period_end: new Date(subscription.cancel_at!),
    metadata: withoutPaykitMetadata(stringifyObjectValues(subscription.metadata ?? {})),
  };
};

/**
 * Invoice
 */
type InvoicePayload = Stripe.Invoice & { billingMode: BillingMode };

export const paykitInvoice$InboundSchema = (invoice: InvoicePayload): Invoice => {
  const status = ((): InvoiceStatus => {
    if (invoice.status == 'paid') return 'paid';
    if (['draft', 'open', 'uncollectible', 'void'].includes(invoice.status as string)) return 'draft';
    throw new Error(`Unknown status: ${invoice.status}`);
  })();

  return {
    id: invoice.id!,
    currency: invoice.currency,
    customer_id: typeof invoice.customer === 'string' ? invoice.customer.toString() : (invoice.customer?.id ?? ''),
    billing_mode: invoice.billingMode,
    amount_paid: invoice.amount_paid,
    line_items: [],
    current_cycle: 0,
    total_cycles: 0,
    subscription_id: null,
    status,
    paid_at: new Date(invoice.created * 1000).toISOString(),
    metadata: withoutPaykitMetadata(stringifyObjectValues(invoice.metadata ?? {})),
  };
};
