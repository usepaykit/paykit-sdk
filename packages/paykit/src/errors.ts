import { PaymentProvider } from './resources/providers';

export class PayKitError extends Error {
  public readonly code: string;
  public readonly provider: PaymentProvider;

  constructor(message: string, code: string, provider: PaymentProvider) {
    super(message);
    this.name = 'PayKitError';
    this.code = code;
    this.provider = provider;
  }
}
