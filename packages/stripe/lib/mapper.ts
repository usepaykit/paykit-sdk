import {
  BillingMode,
  Checkout,
  Customer,
  Invoice,
  InvoiceStatus,
  omitInternalMetadata,
  OverrideProps,
  PaymentStatus,
  Refund,
  Subscription,
  SubscriptionBillingInterval,
} from '@paykit-sdk/core';
import { Payment } from '@paykit-sdk/core';
import Stripe from 'stripe';

/**
 * Checkout
 */
export const paykitCheckout$InboundSchema = (
  checkout: Stripe.Checkout.Session,
  lineItems: Array<
    OverrideProps<Pick<Stripe.LineItem, 'id' | 'quantity'>, { quantity: number }>
  >,
): Checkout => {
  return {
    id: checkout.id,
    customer:
      typeof checkout.customer === 'string'
        ? checkout.customer
        : (checkout.customer?.id ?? ''),
    session_type: checkout.mode === 'subscription' ? 'recurring' : 'one_time',
    payment_url: checkout.url!,
    products: lineItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
    })),
    currency: checkout.currency!,
    amount: checkout.amount_total!,
    subscription: null,
    metadata: omitInternalMetadata(checkout.metadata ?? {}),
  };
};

/**
 * Customer
 */
export const paykitCustomer$InboundSchema = (customer: Stripe.Customer): Customer => {
  return {
    id: customer.id,
    email: customer.email ?? '',
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    metadata: omitInternalMetadata(customer.metadata ?? {}),
  };
};

/**
 * Subscription
 */
export const paykitSubscription$InboundSchema = (
  subscription: Stripe.Subscription,
): Subscription => {
  const status = (() => {
    if (['active', 'trialing'].includes(subscription.status)) return 'active';
    if (['incomplete_expired', 'incomplete', 'past_due'].includes(subscription.status))
      return 'past_due';
    if (['canceled'].includes(subscription.status)) return 'canceled';
    if (['expired'].includes(subscription.status)) return 'expired';
    throw new Error(`Unknown status: ${subscription.status}`);
  })();

  const metadata = omitInternalMetadata(subscription.metadata ?? {});

  return {
    id: subscription.id,
    status,
    customer:
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id,
    amount: subscription.items.data[0].price.unit_amount!,
    currency: subscription.items.data[0].price.currency!,
    item_id: subscription.items.data[0].id,
    billing_interval: subscription.items.data[0].price.recurring
      ?.interval as SubscriptionBillingInterval,
    current_period_start: new Date(subscription.start_date),
    current_period_end: new Date(subscription.cancel_at!),
    metadata,
    custom_fields: null,
  };
};

/**
 * Invoice
 */
type InvoicePayload = Stripe.Invoice & { billingMode: BillingMode };

export const paykitInvoice$InboundSchema = (invoice: InvoicePayload): Invoice => {
  const status = ((): InvoiceStatus => {
    if (invoice.status == 'paid') return 'paid';
    if (['draft', 'open', 'uncollectible', 'void'].includes(invoice.status as string))
      return 'open';
    throw new Error(`Unknown status: ${invoice.status}`);
  })();

  const customerId = (() => {
    if (typeof invoice.customer === 'string') return invoice.customer;
    if (invoice.customer?.id) return invoice.customer.id;
    throw new Error(`Unknown customer ID: ${invoice.customer}`);
  })();

  return {
    id: invoice.id!,
    currency: invoice.currency,
    customer: customerId,
    billing_mode: invoice.billingMode,
    amount_paid: invoice.amount_paid,
    line_items: invoice.lines.data.map(line => ({
      id: line.id!,
      quantity: line.quantity!,
    })),
    subscription_id:
      invoice.parent?.subscription_details?.subscription?.toString() ?? null,
    status,
    paid_at: new Date(invoice.created * 1000).toISOString(),
    metadata: omitInternalMetadata(invoice.metadata ?? {}),
    custom_fields:
      invoice.custom_fields?.reduce(
        (acc, field) => {
          acc[field.name] = field.value;
          return acc;
        },
        {} as Record<string, unknown>,
      ) ?? null,
  };
};

/**
 * Payment
 */
const stripeToPaykitStatus = (status: Stripe.PaymentIntent.Status): PaymentStatus => {
  switch (status) {
    case 'requires_payment_method':
    case 'requires_confirmation':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'requires_action':
      return 'requires_action';
    case 'requires_capture':
      return 'requires_capture';
    case 'succeeded':
      return 'succeeded';
    case 'canceled':
      return 'canceled';
    default:
      return 'failed';
  }
};

export const paykitPayment$InboundSchema = (intent: Stripe.PaymentIntent): Payment => {
  return {
    id: intent.id,
    amount: intent.amount,
    currency: intent.currency,
    customer: (intent.customer as string) ?? '',
    status: stripeToPaykitStatus(intent.status),
    metadata: omitInternalMetadata(intent.metadata ?? {}),
    product_id: intent.metadata?.product_id as string | null,
  };
};

/**
 * Refund
 */
export const paykitRefund$InboundSchema = (refund: Stripe.Refund): Refund => {
  return {
    id: refund.id,
    amount: refund.amount,
    currency: refund.currency,
    reason: refund.reason,
    metadata: omitInternalMetadata(refund.metadata ?? {}),
  };
};
