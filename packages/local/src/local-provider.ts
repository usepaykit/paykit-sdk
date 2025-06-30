import { PaykitProviderOptions, safeEncode } from '@paykit-sdk/core';
import { PaymentInfo } from './types';

export interface LocalConfig extends PaykitProviderOptions {}

export class LocalProvider {
  constructor(private readonly config: LocalConfig) {}

  #paymentUrl = 'https://paykit.com/pay';

  async createPaymentLink(paymentInfo: PaymentInfo) {
    const encoded = safeEncode(paymentInfo);
    return `${this.#paymentUrl}/${encoded}`;
  }
}
