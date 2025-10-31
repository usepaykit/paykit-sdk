import {
  Checkout,
  Invoice,
  omitInternalMetadata,
  Payee,
  Payment,
  Refund,
  Subscription,
} from '@paykit-sdk/core';
import {
  Order,
  OrderStatus,
  Payer,
  Refund as PayPalRefund,
} from '@paypal/paypal-server-sdk';
import { PayPalSubscription } from '../types';

export const paykitPayee$InboundSchema = (payee: Payer | string): Payee => {
  let customer: Payee = { email: '' };

  if (typeof payee === 'string') customer = payee;
  else if (payee?.emailAddress) customer = { email: payee?.emailAddress };

  return customer;
};

/**
 * Refund
 */
export const paykitRefund$InboundSchema = (refund: PayPalRefund): Refund => {
  return {
    id: refund.id!,
    amount: refund.amount?.value ? parseFloat(refund.amount.value) : 0,
    currency: refund.amount?.currencyCode || 'USD',
    metadata: omitInternalMetadata(JSON.parse(refund.customId ?? '{}')),
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
    customer: paykitPayee$InboundSchema(order.payer ?? {}),
    session_type: 'one_time',
    products: [{ id: order.purchaseUnits?.[0]?.items?.[0]?.sku || '', quantity: 1 }],
    metadata: omitInternalMetadata(
      JSON.parse(order.purchaseUnits?.[0]?.customId ?? '{}'),
    ),
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

  const approveLink = order.links?.find(l => l.rel === 'approve')?.href ?? '';
  const requiresAction = [
    OrderStatus.PayerActionRequired,
    OrderStatus.Created,
    OrderStatus.Saved,
  ].includes(order.status as OrderStatus);

  return {
    id: order.id!,
    status,
    customer: paykitPayee$InboundSchema(order.payer ?? {}),
    amount: parseFloat(order.purchaseUnits?.[0]?.amount?.value || '0'),
    currency: order.purchaseUnits?.[0]?.amount?.currencyCode || 'USD',
    metadata: omitInternalMetadata(
      JSON.parse(order.purchaseUnits?.[0]?.customId ?? '{}'),
    ),
    item_id: order.purchaseUnits?.[0]?.items?.[0]?.sku || '',
    requires_action: requiresAction,
    payment_url: approveLink,
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

export const paykitInvoice$InboundSchema = (order: Order): Invoice => {
  return {
    id: order.id!,
    amount_paid: parseFloat(order.purchaseUnits?.[0]?.amount?.value || '0'),
    currency: order.purchaseUnits?.[0]?.amount?.currencyCode || 'USD',
    customer: paykitPayee$InboundSchema(order.payer ?? {}),
    status: 'paid',
    paid_at: new Date().toISOString(),
    metadata: omitInternalMetadata(
      JSON.parse(order.purchaseUnits?.[0]?.customId ?? '{}'),
    ),
    custom_fields: null,
    subscription_id: null,
    billing_mode: 'one_time',
    line_items: [{ id: order.purchaseUnits?.[0]?.items?.[0]?.sku || '', quantity: 1 }],
  };
};

// Webhooks

export const paykitPaymentWebhook$InboundSchema = (
  resource: Record<string, unknown>,
): Payment => {
  const statusMap: Record<string, Payment['status']> = {
    CREATED: 'pending',
    SAVED: 'pending',
    APPROVED: 'requires_capture',
    VOIDED: 'canceled',
    COMPLETED: 'succeeded',
    PAYER_ACTION_REQUIRED: 'requires_action',
  };

  const status = statusMap[(resource.status as string) ?? 'CREATED'] ?? 'pending';

  // Handle payer - webhook uses snake_case
  const payer = resource.payer as Record<string, unknown> | undefined;
  let customer: Payee = { email: '' };

  if (payer?.payer_id) {
    customer = payer.payer_id as string;
  } else if (payer?.email_address) {
    customer = { email: payer.email_address as string };
  }

  // Handle purchase_units - webhook uses snake_case
  const purchaseUnits =
    (resource.purchase_units as Record<string, unknown>[] | undefined) ?? [];
  const firstUnit = purchaseUnits[0] ?? {};
  const amount = firstUnit.amount as Record<string, unknown> | undefined;
  const items = (firstUnit.items as Record<string, unknown>[] | undefined) ?? [];

  const metadata = (() => {
    try {
      const customId = firstUnit?.custom_id as string | undefined;
      return customId ? JSON.parse(customId) : {};
    } catch {
      return {};
    }
  })();

  // Use sku from items if available, otherwise use reference_id
  const itemId =
    (items[0]?.sku as string | undefined) ??
    (firstUnit.reference_id as string | undefined) ??
    '';

  return {
    id: resource.id as string,
    status,
    customer,
    amount: parseFloat((amount?.value as string | undefined) ?? '0'),
    currency: (amount?.currency_code as string | undefined) ?? 'USD',
    metadata: omitInternalMetadata(metadata),
    item_id: itemId,
    requires_action: false,
    payment_url: null,
  };
};

export const paykitPaymentCaptureWebhook$InboundSchema = (
  capture: Record<string, unknown>,
): Payment => {
  const statusMap: Record<string, Payment['status']> = {
    COMPLETED: 'succeeded',
    PENDING: 'pending',
    REFUNDED: 'succeeded', // Refunded but was successful
    PARTIALLY_REFUNDED: 'succeeded',
  };

  const status = statusMap[(capture.status as string) ?? 'PENDING'] ?? 'pending';

  // Get order_id from supplementary_data for the payment id
  const supplementaryData = capture.supplementary_data as
    | Record<string, unknown>
    | undefined;
  const relatedIds = supplementaryData?.related_ids as
    | Record<string, unknown>
    | undefined;
  const orderId = (relatedIds?.order_id as string | undefined) ?? (capture.id as string);

  const metadata = (() => {
    try {
      const customId = capture.custom_id as string | undefined;
      return customId ? JSON.parse(customId) : {};
    } catch {
      return {};
    }
  })();

  const amount = capture.amount as Record<string, unknown> | undefined;

  return {
    id: orderId,
    status,
    customer: { email: '' }, // Not available in capture event
    amount: parseFloat((amount?.value as string | undefined) ?? '0'),
    currency: (amount?.currency_code as string | undefined) ?? 'USD',
    metadata: omitInternalMetadata(metadata),
    item_id: '', // Not available in capture event
    requires_action: false,
    payment_url: null,
  };
};

export const paykitRefundWebhook$InboundSchema = (
  refund: Record<string, unknown>,
): Refund => {
  const amount = refund.amount as { total: string; currency: string } | undefined;

  // Convert total to positive number (webhook sends negative for refunds)
  const refundAmount = amount?.total ? Math.abs(parseFloat(amount.total)) : 0;

  return {
    id: refund.id as string,
    amount: refundAmount,
    currency: amount?.currency ?? 'USD',
    metadata: omitInternalMetadata({}), // No metadata in webhook refund
    reason: null, // No reason in webhook refund
  };
};

export const paykitSubscriptionWebhook$InboundSchema = (
  agreement: Record<string, unknown>,
): Subscription => {
  const state = (agreement.state as string) ?? 'Pending';
  const statusMap: Record<string, Subscription['status']> = {
    Pending: 'pending',
    Active: 'active',
    Suspended: 'past_due',
    Cancelled: 'canceled',
    Expired: 'canceled',
    Completed: 'active',
  };

  const status = statusMap[state] ?? 'pending';

  // Extract billing interval from plan.payment_definitions
  const plan = agreement.plan as Record<string, unknown> | undefined;
  const paymentDefinitions =
    (plan?.payment_definitions as Record<string, unknown>[] | undefined) ?? [];

  // Find REGULAR payment definition (skip TRIAL)
  const regularDefinition =
    paymentDefinitions.find(def => (def.type as string) === 'REGULAR') ??
    paymentDefinitions[0];

  const frequency = (regularDefinition?.frequency as string) ?? 'Month';
  const billingIntervalMap: Record<string, Subscription['billing_interval']> = {
    Day: 'day',
    Days: 'day',
    Week: 'week',
    Weeks: 'week',
    Month: 'month',
    Months: 'month',
    Year: 'year',
    Years: 'year',
  };

  const billingInterval = billingIntervalMap[frequency] ?? 'month';

  // Get start date (webhook uses start_date)
  const startDate = (agreement.start_date as string) ?? new Date().toISOString();
  const periodStart = new Date(startDate);

  // Calculate period end from start + billing interval
  const periodEnd = (() => {
    const end = new Date(periodStart);
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

  const payer = agreement.payer as Record<string, unknown> | undefined;
  const payerInfo = payer?.payer_info as Record<string, unknown> | undefined;
  const email = (payerInfo?.email as string) ?? '';

  // Use agreement ID as item_id if plan ID not available
  const planId = (plan?.id as string) ?? (agreement.id as string);

  const amount = regularDefinition?.amount as Record<string, unknown> | undefined;
  const subscriptionAmount = amount?.value ? parseFloat(amount.value as string) : 0;

  const currency = (plan?.curr_code as string) ?? 'USD';

  const metadata = (() => {
    try {
      const description = agreement.description as string | undefined;
      return description ? JSON.parse(description) : {};
    } catch {
      return {};
    }
  })();

  return {
    id: agreement.id as string,
    customer: { email },
    status,
    item_id: planId,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    metadata: omitInternalMetadata(metadata),
    billing_interval: billingInterval,
    amount: subscriptionAmount,
    currency,
    custom_fields: null,
  };
};
