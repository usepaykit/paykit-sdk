import { PaykitProviderOptions, safeEncode } from '@paykit-sdk/core';
import { CheckoutInfo } from './types';

export interface LocalConfig extends PaykitProviderOptions {}

export class LocalProvider {
  constructor(private readonly config: LocalConfig) {}

  #paymentUrl = 'https://paykit.com/pay';

  async createPaymentLink(checkoutInfo: CheckoutInfo) {
    const encoded = safeEncode(checkoutInfo);
    return `${this.#paymentUrl}/${encoded}`;
  }
}
