import {
  Checkout,
  Payment,
  Refund,
  omitInternalMetadata,
  parseJSON,
  WebhookEventType,
  PAYKIT_METADATA_KEY,
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
  const metadataObj = (data.metaData || {}) as Record<string, unknown>;
  const paykitMetadata = metadataObj[PAYKIT_METADATA_KEY];

  let item = '';
  let qty = 1;

  if (paykitMetadata) {
    try {
      const parsed = parseJSON(
        typeof paykitMetadata === 'string'
          ? paykitMetadata
          : JSON.stringify(paykitMetadata),
        z.object({ item: z.string(), qty: z.number() }),
      );
      item = parsed.item;
      qty = parsed.qty;
    } catch {
      // If parsing fails, use defaults
    }
  }

  const metadata = omitInternalMetadata(metadataObj);

  return {
    id: data.transactionReference || data.paymentReference || '',
    amount: data.amountPaid || data.amount || 0,
    currency: data.currencyCode || data.currency || 'NGN',
    customer: { email: data?.customerEmail || data?.customer?.email || '' },
    payment_url: data.checkoutUrl || null,
    metadata,
    session_type: 'one_time',
    products: [{ id: item, quantity: qty }],
  };
};

export const paykitPayment$InboundSchema = (data: Record<string, any>): Payment => {
  const metadataObj = (data.metaData || {}) as Record<string, unknown>;
  const paykitMetadata = metadataObj[PAYKIT_METADATA_KEY];

  let item: string | null = null;

  if (paykitMetadata) {
    try {
      const parsed = parseJSON(
        typeof paykitMetadata === 'string'
          ? paykitMetadata
          : JSON.stringify(paykitMetadata),
        z.object({ item: z.string().optional() }),
      );
      item = parsed.item || null;
    } catch {
      // If parsing fails, item remains null
    }
  }

  const metadata = omitInternalMetadata(metadataObj);

  const statusMap: Record<string, Payment['status']> = {
    PAID: 'succeeded',
    OVERPAID: 'succeeded',
    PARTIALLY_PAID: 'processing',
    PENDING: 'pending',
    FAILED: 'failed',
    CANCELLED: 'canceled',
    REVERSED: 'canceled',
    EXPIRED: 'failed',
  };

  const paymentStatus = data.paymentStatus || data.status || 'PENDING';
  const status = statusMap[paymentStatus] || 'pending';
  const requiresAction = status === 'pending' || status === 'processing';

  return {
    id: data.transactionReference || data.paymentReference || '',
    amount: data.amountPaid || data.amount || 0,
    currency: data.currencyCode || data.currency || 'NGN',
    customer: { email: data?.customerEmail || data?.customer?.email || '' },
    status,
    item_id: item,
    metadata,
    requires_action: requiresAction,
    payment_url: null,
  };
};

export const paykitRefund$InboundSchema = (data: Record<string, any>): Refund => {
  const metadata = omitInternalMetadata(data.metaData ?? {});

  return {
    id: data.transactionReference || data.refundReference || crypto.randomUUID(),
    amount: data.amountRefunded || data.amount || 0,
    currency: data.currencyCode || data.currency || 'NGN',
    reason: data.refundReason || data.reason || null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  };
};
