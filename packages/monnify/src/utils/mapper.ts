import {
  Checkout,
  omitInternalMetadata,
  parseJSON,
  WebhookEventType,
} from '@paykit-sdk/core';
import z from 'zod';

export const monnifyToPaykitEventMap: Record<
  string,
  string | null | ((eventData: Record<string, unknown>) => WebhookEventType)
> = {
  CUSTOMER_CREATED: null,
  CUSTOMER_UPDATED: null,
  CUSTOMER_DELETED: null,

  // Subscription (Direct Debit Mandates)
  MANDATE_UPDATE: (eventData: Record<string, unknown>) => {
    const status = eventData.mandateStatus;

    if (status === 'ACTIVE' || status === 'PENDING') {
      return 'subscription.created';
    }

    if (status === 'CANCELLED') {
      return 'subscription.canceled';
    }

    return 'subscription.updated'; // catch-all for mandate changes
  },

  // Payments
  SUCCESSFUL_TRANSACTION: 'payment.created',

  REJECTED_PAYMENT: 'payment.updated',

  SETTLEMENT: 'payment.updated',

  // Refunds
  SUCCESSFUL_REFUND: 'refund.created',
  FAILED_REFUND: 'refund.created',

  // Disbursements → could map to payout.*, but Paykit does not support payouts yet
  SUCCESSFUL_DISBURSEMENT: null,
  FAILED_DISBURSEMENT: null,
  REVERSED_DISBURSEMENT: null,

  // Offline payments also count as payment.created
  SUCCESSFUL_TRANSACTION_OFFLINE: 'payment.created',
};

export const paykitCheckout$InboundSchema = (data: Record<string, any>): Checkout => {
  const { item, qty } = parseJSON(
    data.metaData,
    z.object({ item: z.string(), qty: z.number() }),
  );

  const metadata = omitInternalMetadata(data.metaData as Record<string, unknown>);

  return {
    id: data.transactionReference,
    amount: data.paymentReference,
    currency: data.currency,
    customer: { email: data?.customer?.email as string },
    payment_url: data.checkoutUrl,
    metadata,
    session_type: 'one_time',
    products: [{ id: item, quantity: qty }],
  };
};
