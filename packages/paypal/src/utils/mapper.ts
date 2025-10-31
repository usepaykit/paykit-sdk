import {
  Checkout,
  omitInternalMetadata,
  Payment,
  Refund,
  Subscription,
} from '@paykit-sdk/core';
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
    metadata: refund.customId ? omitInternalMetadata(JSON.parse(refund.customId)) : {},
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
    customer: order.payer?.payerId
      ? order.payer?.payerId
      : { email: order.payer?.emailAddress ?? '' },
    session_type: 'one_time',
    products: [{ id: order.purchaseUnits?.[0]?.items?.[0]?.sku || '', quantity: 1 }],
    metadata: order.purchaseUnits?.[0]?.customId
      ? omitInternalMetadata(JSON.parse(order.purchaseUnits?.[0]?.customId))
      : {},
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

  const status = statusMap[order.status ?? statusMap.CREATED];

  return {
    id: order.id!,
    status,
    amount: parseFloat(order.purchaseUnits?.[0]?.amount?.value || '0'),
    currency: order.purchaseUnits?.[0]?.amount?.currencyCode || 'USD',
    metadata: order.purchaseUnits?.[0]?.customId
      ? omitInternalMetadata(JSON.parse(order.purchaseUnits?.[0]?.customId))
      : {},
    customer: order.payer?.payerId
      ? order.payer?.payerId
      : { email: order.payer?.emailAddress ?? '' },
    item_id: order.purchaseUnits?.[0]?.items?.[0]?.sku || '',

    // todo: Add requires_action and payment_url
    requires_action: false,
    payment_url: '',
  };
};

/**
 * Subscription
 */
export const paykitSubscription$InboundSchema = (
  subscription: PayPalSubscription,
): Subscription => {
  const statusMap: Record<string, Subscription['status']> = {
    APPROVAL_PENDING: 'pending',
    APPROVED: 'active',
    ACTIVE: 'active',
    SUSPENDED: 'past_due',
    CANCELLED: 'canceled',
    EXPIRED: 'canceled',
  };

  const status = statusMap[subscription.status ?? statusMap.APPROVAL_PENDING];

  // Extract billing interval from cycle_executions or default to 'month'
  const tenureType =
    subscription.billing_info?.cycle_executions?.[0]?.tenure_type?.toUpperCase();
  const billingIntervalMap: Record<string, Subscription['billing_interval']> = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
  };

  const billingInterval =
    tenureType && billingIntervalMap[tenureType]
      ? billingIntervalMap[tenureType]
      : 'month';

  // Calculate period end from start_time + billing interval
  const periodStart = subscription.start_time
    ? new Date(subscription.start_time)
    : new Date();

  const periodEnd = (() => {
    if (!subscription.start_time) {
      return new Date();
    }

    const start = new Date(subscription.start_time);
    const end = new Date(start);

    switch (billingInterval) {
      case 'day':
        end.setDate(end.getDate() + 1);
        break;
      case 'week':
        end.setDate(end.getDate() + 7);
        break;
      case 'month':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'year':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }

    return end;
  })();

  return {
    id: subscription.id,
    customer: { email: subscription.subscriber?.email_address ?? '' },
    status,
    item_id: subscription.plan_id,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    metadata: omitInternalMetadata(JSON.parse(subscription?.customId ?? '{}')),
    billing_interval: billingInterval,
    amount: 0,
    currency: 'USD',
    custom_fields: null,
  };
};
