import {
  Subscription as PaykitSubscription,
  toPaykitSubscriptionStatus,
  Checkout as PaykitCheckout,
  Customer as PaykitCustomer,
} from '@paykit-sdk/core/src/resources/';
import { StringMetadata } from '@paykit-sdk/core/src/types';
import { Checkout } from '@polar-sh/sdk/dist/commonjs/models/components/checkout';
import { Customer } from '@polar-sh/sdk/dist/commonjs/models/components/customer';
import { Subscription } from '@polar-sh/sdk/dist/commonjs/models/components/subscription';

export const toPaykitCheckout = (checkout: Checkout): PaykitCheckout => {
  return {
    id: checkout.id,
    url: checkout.url,
    cancel_url: undefined,
    customer_id: checkout.customerId!,
    mode: 'payment',
    success_url: checkout.successUrl,
    products: checkout.products.map(product => ({ id: product.id, quantity: 1 })),
    metadata: checkout.metadata as StringMetadata,
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
