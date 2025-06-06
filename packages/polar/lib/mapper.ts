import { Checkout } from '@polar-sh/sdk/models/components/checkout.js';
import { Customer } from '@polar-sh/sdk/models/components/customer.js';
import { Subscription } from '@polar-sh/sdk/models/components/subscription.js';
import { Checkout as PaykitCheckout } from '../../paykit/src/resources/checkout.ts';
import { Customer as PaykitCustomer } from '../../paykit/src/resources/customer.ts';
import { Subscription as PaykitSubscription, toPaykitSubscriptionStatus } from '../../paykit/src/resources/subscription.ts';

export const toPaykitCheckout = (checkout: Checkout): PaykitCheckout => {
  return {
    id: checkout.id,
    url: checkout.url,
    cancel_url: undefined,
    customer_id: checkout.customerId!,
    mode: 'payment',
    success_url: checkout.successUrl,
    products: checkout.products.map(product => ({ id: product.id, quantity: 1 })),
    metadata: checkout.metadata as Record<string, string>,
  };
};

export const toPaykitCustomer = (customer: Customer): PaykitCustomer => {
  return { id: customer.id, email: customer.email, name: customer.name ?? undefined };
};

export const toPaykitSubscription = (subscription: Subscription): PaykitSubscription => {
  return {
    id: subscription.id,
    customer_id: subscription.customerId,
    status: toPaykitSubscriptionStatus<Subscription['status']>(subscription.status),
    current_period_start: new Date(subscription.currentPeriodStart),
    current_period_end: new Date(subscription.currentPeriodEnd!),
  };
};
