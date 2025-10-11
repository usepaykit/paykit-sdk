import { Invoice, Payment, Subscription } from '@paykit-sdk/core';
import { GoPayPaymentResponse } from '../schema';

export const paykitPayment$InboundSchema = (data: GoPayPaymentResponse): Payment => {
  return {
    id: data.id.toString(),
    amount: data.amount,
    currency: data.currency,
    customer: data.payer ?? { email: data.payer?.email ?? '' },
    status: data.state as Payment['status'],
    product_id: null,
    metadata: {}, // todo: find metadata path
  };
};

export const paykitInvoice$InboundSchema = (data: GoPayPaymentResponse, isSubscription: boolean): Invoice => {
  const status = (() => {
    if (data.state === 'PAID') return 'paid';
    return 'open';
  })();

  return {
    id: data.id.toString(),
    amount_paid: data.amount,
    currency: data.currency,
    customer: data.payer ?? { email: data.payer?.email ?? '' },
    status,
    paid_at: new Date().toISOString(),
    metadata: {}, // todo: find metadata path
    custom_fields: null,
    subscription_id: isSubscription ? data.id.toString() : null,
    billing_mode: isSubscription ? 'recurring' : 'one_time',
    line_items: [],
  };
};

export const paykitSubscription$InboundSchema = (data: GoPayPaymentResponse): Subscription => {
  const itemId = 'paykit:' + data.id.toString(); // todo: find item id path

  return {
    id: data.id.toString(),
    status: 'active',
    customer: data.payer ?? { email: data.payer?.email ?? '' },
    item_id: itemId,
    billing_interval: data.recurrence?.recurrence_cycle ?? 'ON_DEMAND',
    currency: data.currency,
    amount: data.amount,
    metadata: {}, // todo: find metadata path
    custom_fields: null,
    current_period_start: new Date(data.recurrence?.recurrence_date_to ?? ''),
    current_period_end: new Date(data.recurrence?.recurrence_date_to ?? ''),
  };
};
