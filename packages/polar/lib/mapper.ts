import {
  Subscription as PaykitSubscription,
  Checkout as PaykitCheckout,
  Customer as PaykitCustomer,
  Invoice as PaykitInvoice,
  PaykitMetadata,
  SubscriptionStatus,
  BillingMode,
  Payment,
  PaymentStatus,
  Refund as PaykitRefund,
  omitInternalMetadata,
  PAYKIT_METADATA_KEY,
} from '@paykit-sdk/core';
import { Checkout } from '@polar-sh/sdk/models/components/checkout';
import { CheckoutStatus } from '@polar-sh/sdk/models/components/checkoutstatus.js';
import { Customer } from '@polar-sh/sdk/models/components/customer';
import { Order } from '@polar-sh/sdk/models/components/order';
import { Refund } from '@polar-sh/sdk/models/components/refund.js';
import { RefundReason } from '@polar-sh/sdk/models/components/refundreason.js';
import { Subscription } from '@polar-sh/sdk/models/components/subscription';

/**
 * Checkout
 */
export const paykitCheckout$InboundSchema = (checkout: Checkout): PaykitCheckout => {
  return {
    id: checkout.id,
    payment_url: checkout.url,
    customer: checkout.customerId
      ? checkout.customerId
      : { email: checkout.customerEmail ?? '' },
    session_type: checkout.subscriptionId ? 'recurring' : 'one_time',
    products: checkout.products.map(product => ({ id: product.id, quantity: 1 })),
    metadata: (checkout.metadata as PaykitMetadata) ?? null,
    currency: checkout.currency,
    amount: checkout.amount,
  };
};

/**
 * Customer
 */
export const paykitCustomer$InboundSchema = (customer: Customer): PaykitCustomer => {
  const phone =
    JSON.parse((customer.metadata?.[PAYKIT_METADATA_KEY] as string) ?? '{}').phone ?? '';

  return {
    id: customer.id,
    email: customer.email,
    name: customer.name ?? '',
    phone,
    metadata: omitInternalMetadata(customer.metadata ?? {}),
  };
};

/**
 * Subscription
 */
const toPaykitSubscriptionStatus = (
  status: Subscription['status'],
): SubscriptionStatus => {
  if (status === 'active') return 'active';
  if (status === 'past_due' || status === 'incomplete') return 'past_due';
  if (status === 'canceled' || status === 'unpaid') return 'canceled';
  if (status === 'incomplete_expired') return 'expired';
  throw new Error(`Unhandled status: ${status}`);
};

/**
 * Subscription
 */
export const paykitSubscription$InboundSchema = (
  subscription: Subscription,
): PaykitSubscription => {
  return {
    id: subscription.id,
    customer: subscription.customerId
      ? subscription.customerId
      : { email: subscription.customer.email ?? '' },
    status: toPaykitSubscriptionStatus(subscription.status),
    current_period_start: new Date(subscription.currentPeriodStart),
    current_period_end: new Date(subscription.currentPeriodEnd!),
    metadata: omitInternalMetadata(subscription.metadata ?? {}),
    custom_fields: subscription.customFieldData ?? null,
    item_id: subscription.productId,
    billing_interval: subscription.recurringInterval,
    currency: subscription.currency,
    amount: subscription.amount,
  };
};

/**
 * Invoice
 */

type InvoicePayload = Order & { billingMode: BillingMode };

export const paykitInvoice$InboundSchema = (invoice: InvoicePayload): PaykitInvoice => {
  const status = (() => {
    if (invoice.status == 'paid') return 'paid';
    return 'open';
  })();

  return {
    id: invoice.id,
    amount_paid: invoice.totalAmount,
    currency: invoice.currency,
    metadata: omitInternalMetadata(invoice.metadata ?? {}),
    customer: invoice.customerId
      ? invoice.customerId
      : { email: invoice.customer.email ?? '' },
    billing_mode: invoice.billingMode,
    custom_fields: invoice.customFieldData ?? null,
    status,
    subscription_id: invoice.subscription?.id ?? null,
    paid_at: new Date(invoice.createdAt).toISOString(),
    line_items: [],
  };
};

/**
 * Payment
 */
export const paykitPayment$InboundSchema = (checkout: Checkout): Payment => {
  const statusMap: Record<CheckoutStatus, PaymentStatus> = {
    open: 'pending',
    expired: 'canceled',
    confirmed: 'requires_capture',
    succeeded: 'succeeded',
    failed: 'failed',
  } as const;

  return {
    id: checkout.id,
    amount: checkout.amount,
    currency: checkout.currency,
    customer: checkout.customerId
      ? checkout.customerId
      : { email: checkout.customerEmail ?? '' },
    status: statusMap[checkout.status],
    metadata: (checkout.metadata as PaykitMetadata) ?? {},
    item_id: checkout.products.length > 0 ? checkout.products[0].id : null,
  };
};

/**
 * Refund
 */
export const mapRefundReason = (debug: boolean, reason: string): RefundReason => {
  const reasonMap: Record<string, RefundReason> = {
    duplicate: 'duplicate',
    fraudulent: 'fraudulent',
    requested_by_customer: 'customer_request',
    customer_request: 'customer_request',
  };

  const mapped = reasonMap[reason.toLowerCase()] ?? 'other';

  if (debug && mapped === 'other' && !reason.toLowerCase().includes('other')) {
    console.warn(
      `[Polar Provider] Unmapped refund reason: "${reason}" -> defaulting to "other"`,
    );
  }

  return mapped;
};

export const paykitRefund$InboundSchema = (refund: Refund): PaykitRefund => {
  return {
    id: refund.id,
    amount: refund.amount,
    currency: refund.currency,
    reason: refund.reason,
    metadata: omitInternalMetadata(refund.metadata ?? {}),
  };
};
