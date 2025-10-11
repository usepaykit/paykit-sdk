import { Invoice, Payment } from '@paykit-sdk/core';
import _ from 'lodash';
import { ComgateWebhookStatusSuccessResponse } from '../schema';

export const paykitPayment$InboundSchema = (webhookResponse: ComgateWebhookStatusSuccessResponse, status: Payment['status']): Payment => {
  return {
    id: webhookResponse.transId,
    amount: webhookResponse.price,
    currency: webhookResponse.curr,
    customer: webhookResponse.payerId ?? { email: webhookResponse.email },
    status,
    metadata: _.mapValues(JSON.parse(webhookResponse.refId) as Record<string, unknown>, value => String(value)),
    product_id: null,
  };
};

export const paykitInvoice$InboundSchema = (webhookResponse: ComgateWebhookStatusSuccessResponse): Invoice => {
  const status = ((): Invoice['status'] => {
    if (webhookResponse.status == 'PAID') return 'paid';
    return 'open';
  })();

  return {
    id: webhookResponse.transId,
    status,
    paid_at: new Date().toISOString(),
    amount_paid: webhookResponse.price,
    currency: webhookResponse.curr,
    customer: webhookResponse.payerId ?? { email: webhookResponse.email },
    custom_fields: null,
    subscription_id: null,
    billing_mode: 'one_time', // comgate does not support recurring payments
    line_items: webhookResponse.name ? [{ id: webhookResponse.name, quantity: 1 }] : [],
    metadata: _.mapValues(JSON.parse(webhookResponse.refId) as Record<string, unknown>, value => String(value)),
  };
};
