import {
  Subscription as PaykitSubscription,
  Checkout as PaykitCheckout,
  Customer as PaykitCustomer,
  Invoice as PaykitInvoice,
  PaykitMetadata,
  SubscriptionStatus,
  stringifyObjectValues,
} from '@paykit-sdk/core';
import { Checkout } from '@polar-sh/sdk/models/components/checkout';
import { Customer } from '@polar-sh/sdk/models/components/customer';
import { Order } from '@polar-sh/sdk/models/components/order';
import { Subscription } from '@polar-sh/sdk/models/components/subscription';

export const toPaykitCheckout = (checkout: Checkout): PaykitCheckout => {
  return {
    id: checkout.id,
    payment_url: checkout.url,
    customer_id: checkout.customerId!,
    session_type: checkout.subscriptionId ? 'recurring' : 'one_time',
    products: checkout.products.map(product => ({ id: product.id, quantity: 1 })),
    metadata: (checkout.metadata as PaykitMetadata) ?? null,
    currency: checkout.currency,
    amount: checkout.amount,
  };
};

export const toPaykitCustomer = (customer: Customer): PaykitCustomer => {
  return { id: customer.id, email: customer.email, name: customer.name ?? undefined };
};

const toPaykitSubscriptionStatus = (status: Subscription['status']): SubscriptionStatus => {
  if (status === 'active') return 'active';
  if (status === 'past_due' || status === 'incomplete') return 'past_due';
  if (status === 'canceled' || status === 'unpaid') return 'canceled';
  if (status === 'incomplete_expired') return 'expired';
  throw new Error(`Unhandled status: ${status}`);
};

export const toPaykitSubscription = (subscription: Subscription): PaykitSubscription => {
  return {
    id: subscription.id,
    customer_id: subscription.customerId,
    status: toPaykitSubscriptionStatus(subscription.status),
    current_period_start: new Date(subscription.currentPeriodStart),
    current_period_end: new Date(subscription.currentPeriodEnd!),
    metadata: stringifyObjectValues({ ...(subscription.metadata ?? {}), customFieldData: subscription.customFieldData }),
  };
};

export const toPaykitInvoice = (invoice: Order): PaykitInvoice => {
  return {
    id: invoice.id,
    amount: invoice.totalAmount,
    currency: invoice.currency,
    metadata: stringifyObjectValues(invoice.metadata ?? {}),
    customer_id: invoice.customerId,
  };
};
