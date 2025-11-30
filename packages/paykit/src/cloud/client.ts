import { OverrideProps, PaykitProviderOptions } from '../types';
import { CustomerClient } from './customer';

export interface ClientOptions
  extends OverrideProps<
    PaykitProviderOptions<{ provider: string }>,
    { cloudApiKey: string }
  > {}

const BASE_URLS = {
  production: 'https://api.usepaykit.dev',
  sandbox: 'https://api.sandbox.usepaykit.dev',
} as const;

export class PayKitCloudClient {
  public readonly customers: CustomerClient;

  constructor(private options: ClientOptions) {
    const environment = options.isSandbox ? 'sandbox' : 'production';
    const baseUrl = BASE_URLS[environment];

    this.customers = new CustomerClient({
      apiKey: options.cloudApiKey,
      baseUrl,
      provider: options.provider,
    });
  }
}
