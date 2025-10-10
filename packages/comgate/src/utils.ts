import { Payment } from '@paykit-sdk/core';

export const isComgateError = (result: Record<string, unknown>): boolean => {
  if (!result.ok) return true;

  if ((result['value'] as Record<string, unknown>)?.code !== 0) return true;

  return false;
};

export const paykitPayment$InboundSchema = (baseParams: Record<string, any>, apiResponse: Record<string, any>): Payment => {
  return {
    id: apiResponse.value.transId,
    amount: baseParams.amount,
    currency: baseParams.currency,
    customer: baseParams.customer_id,
    status: baseParams.status,
    metadata: {},
    product_id: baseParams.product_id,
  };
};
