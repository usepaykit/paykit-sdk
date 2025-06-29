import { safeParse } from '@paykit-sdk/core';
import { PaymentInfo } from './types';

export const encodePaymentInfo = (paymentInfo: PaymentInfo) => {
  return Buffer.from(JSON.stringify(paymentInfo)).toString('base64');
};

export const decodePaymentInfo = (encoded: string) => {
  return safeParse(Buffer.from(encoded, 'base64').toString('utf-8'), text => JSON.parse(text), 'Invalid payment info');
};
