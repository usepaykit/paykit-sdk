import { PaykitProviderOptions } from '@paykit-sdk/core';
import { PaymentInfo } from './types';
import { encodePaymentInfo } from './utils';

export interface LocalConfig extends PaykitProviderOptions {}

export class LocalProvider {
  constructor(private readonly config: LocalConfig) {}

  #paymentUrl = 'https://paykit.com/pay';

  async createPaymentLink(paymentInfo: PaymentInfo) {
    const encoded = encodePaymentInfo(paymentInfo);
    return `${this.#paymentUrl}/${encoded}`;
  }
}
