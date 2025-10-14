import { Invoice, Payment, Refund, Subscription, PAYKIT_METADATA_KEY, omitInternalMetadata } from '@paykit-sdk/core';
import { GoPayPaymentResponse } from '../schema';

export const paykitPayment$InboundSchema = (data: GoPayPaymentResponse): Payment => {
  const itemId = JSON.parse(data.additional_params?.find(param => param.name === PAYKIT_METADATA_KEY)?.value ?? '{}').itemId;

  const metadata = omitInternalMetadata(
    data.additional_params?.reduce(
      (acc, param) => {
        acc[param.name] = String(param.value);
        return acc;
      },
      {} as Record<string, string>,
    ) ?? {},
  );

  return {
    id: data.id.toString(),
    amount: data.amount,
    currency: data.currency,
    customer: data.payer ?? { email: data.payer?.email ?? '' },
    status: data.state as Payment['status'],
    product_id: itemId,
    metadata,
  };
};

export const paykitInvoice$InboundSchema = (data: GoPayPaymentResponse, isSubscription: boolean): Invoice => {
  const quantity = JSON.parse(data.additional_params?.find(param => param.name === PAYKIT_METADATA_KEY)?.value ?? '{}').qty;
  const itemId = JSON.parse(data.additional_params?.find(param => param.name === PAYKIT_METADATA_KEY)?.value ?? '{}').itemId;

  const status = (() => {
    if (data.state === 'PAID') return 'paid';
    return 'open';
  })();

  // Calculate paid at based on start of subscription or payment
  const paidAt = isSubscription ? new Date(data.recurrence?.recurrence_date_from ?? '') : new Date();

  const metadata = omitInternalMetadata(
    data.additional_params?.reduce(
      (acc, param) => {
        acc[param.name] = String(param.value);
        return acc;
      },
      {} as Record<string, string>,
    ) ?? {},
  );

  return {
    id: data.id.toString(),
    amount_paid: data.amount,
    currency: data.currency,
    customer: data.payer ?? { email: data.payer?.email ?? '' },
    status,
    paid_at: paidAt.toISOString(),
    metadata: metadata ?? {},
    custom_fields: null,
    subscription_id: isSubscription ? data.id.toString() : null,
    billing_mode: isSubscription ? 'recurring' : 'one_time',
    line_items: [{ id: itemId, quantity: parseInt(quantity) }],
  };
};

export const paykitSubscription$InboundSchema = (data: GoPayPaymentResponse): Subscription => {
  const itemId = JSON.parse(data.additional_params?.find(param => param.name === PAYKIT_METADATA_KEY)?.value ?? '{}').itemId;

  const billingIntervalMap: Record<string, Subscription['billing_interval']> = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    ON_DEMAND: 'month',
  };

  const billingInterval = billingIntervalMap[data.recurrence?.recurrence_cycle ?? 'ON_DEMAND'];

  const currentPeriodStart = new Date(data.recurrence?.recurrence_date_from ?? '');
  const currentPeriodEnd = new Date(data.recurrence?.recurrence_date_to ?? '');

  const metadata = omitInternalMetadata(
    data.additional_params?.reduce(
      (acc, param) => {
        acc[param.name] = String(param.value);
        return acc;
      },
      {} as Record<string, string>,
    ) ?? {},
  );

  return {
    id: data.id.toString(),
    status: 'active',
    customer: data.payer ?? { email: data.payer?.email ?? '' },
    item_id: itemId,
    billing_interval: billingInterval,
    currency: data.currency,
    amount: data.amount,
    metadata: metadata ?? {},
    custom_fields: null,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
  };
};

/**
 * Refund
 */
export const paykitRefund$InboundSchema = (data: GoPayPaymentResponse): Refund => {
  return {
    id: data.id.toString(),
    amount: data.amount,
    currency: data.currency,
    reason: data.state,
    metadata: {},
  };
};
