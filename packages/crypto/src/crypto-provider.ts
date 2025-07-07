import {
  PaykitProviderOptions,
  PayKitProvider,
  UnknownError,
  Checkout,
  CreateCustomerParams,
  UpdateCustomerParams,
  UpdateSubscriptionParams,
  $ExtWebhookHandlerConfig,
  WebhookEventPayload,
  Customer,
  CreateCheckoutParams,
  Subscription,
} from '@paykit-sdk/core';
import { ChainConfig } from './chains/__config';

export interface CryptoConfig extends PaykitProviderOptions<{ merchantXpub: string; chain: ChainConfig }> {}

export class CryptoProvider implements PayKitProvider {
  constructor(private config: CryptoConfig) {
    const { chain, ...rest } = config;
  }

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    throw new UnknownError('Not implemented', { provider: 'crypto' });
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    throw new UnknownError('Not implemented', { provider: 'crypto' });
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new UnknownError('Not implemented', { provider: 'gumroad' });
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new UnknownError('Not implemented', { provider: 'gumroad' });
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    throw new UnknownError('Not implemented', { provider: 'gumroad' });
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams): Promise<Subscription> => {
    throw new UnknownError('Not implemented', { provider: 'gumroad' });
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    throw new UnknownError('Not implemented', { provider: 'gumroad' });
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    throw new UnknownError('Not implemented', { provider: 'gumroad' });
  };

  handleWebhook = async (payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
    throw new UnknownError('Not implemented', { provider: 'gumroad' });
  };
}
