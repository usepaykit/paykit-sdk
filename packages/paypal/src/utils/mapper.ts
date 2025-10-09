import { Checkout, Payment, Refund, Subscription } from '@paykit-sdk/core';
import { Order, Refund as PayPalRefund } from '@paypal/paypal-server-sdk';
import { PayPalSubscription } from '../types';

/**
 * Refund
 */
export const paykitRefund$InboundSchema = (refund: PayPalRefund): Refund => {
  return {
    id: refund.id!,
    amount: refund.amount?.value ? parseFloat(refund.amount.value) : 0,
    currency: refund.amount?.currencyCode || 'USD',
    metadata: refund.customId ? JSON.parse(refund.customId) : {},
    reason: refund.noteToPayer ?? null,
  };
};

/**
 * Checkout
 */
export const paykitCheckout$InboundSchema = (order: Order): Checkout => {
  return {
    id: order.id!,
    payment_url: order.links?.find(l => l.rel === 'approve')?.href || '',
    amount: parseFloat(order.purchaseUnits?.[0]?.amount?.value || '0'),
    currency: order.purchaseUnits?.[0]?.amount?.currencyCode || 'USD',
    customer: order.payer?.payerId ? order.payer?.payerId : { email: order.payer?.emailAddress ?? '' },
    session_type: 'one_time',
    products: [{ id: order.purchaseUnits?.[0]?.items?.[0]?.sku || '', quantity: 1 }],
    metadata: order.purchaseUnits?.[0]?.customId ? JSON.parse(order.purchaseUnits?.[0]?.customId) : {},
    subscription: null,
  };
};

/**
 * Payment
 */
export const paykitPayment$InboundSchema = (order: Order): Payment => {
  const statusMap: Record<string, Payment['status']> = {
    CREATED: 'pending',
    SAVED: 'pending',
    APPROVED: 'requires_capture',
    VOIDED: 'canceled',
    COMPLETED: 'succeeded',
    PAYER_ACTION_REQUIRED: 'requires_action',
  };

  const status = statusMap[order.status!] || 'pending';

  return {
    id: order.id!,
    status,
    amount: parseFloat(order.purchaseUnits?.[0]?.amount?.value || '0'),
    currency: order.purchaseUnits?.[0]?.amount?.currencyCode || 'USD',
    metadata: order.purchaseUnits?.[0]?.customId ? JSON.parse(order.purchaseUnits?.[0]?.customId) : {},
    customer: order.payer?.payerId ? order.payer?.payerId : { email: order.payer?.emailAddress ?? '' },
    product_id: order.purchaseUnits?.[0]?.items?.[0]?.sku || '',
  };
};

/**
 * Subscription
 */
export const paykitSubscription$InboundSchema = (subscription: PayPalSubscription): Subscription => {
  const statusMap: Record<string, Subscription['status']> = {
    APPROVAL_PENDING: 'pending',
    APPROVED: 'active',
    ACTIVE: 'active',
    SUSPENDED: 'past_due',
    CANCELLED: 'canceled',
    EXPIRED: 'canceled',
  };

  const status = statusMap[subscription.status] || 'pending';

  return {
    id: subscription.id,
    customer: subscription.subscriber?.email_address ?? '',
    status,
    item_id: subscription.plan_id,
    current_period_start: subscription.start_time ? new Date(subscription.start_time) : new Date(),
    current_period_end: subscription.status_update_time ? new Date(subscription.status_update_time) : new Date(), // todo: Would need to calculate based on billing cycle
    metadata: {},
    billing_interval: 'month',
    amount: 0,
    currency: 'USD',
    custom_fields: null,
    // created_at: subscription.create_time ? new Date(subscription.create_time) : new Date(),
  };
};
