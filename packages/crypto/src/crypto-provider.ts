import {
  PaykitProviderOptions,
  PayKitProvider,
  UnknownError,
  Checkout,
  CreateCustomerParams,
  UpdateCustomerParams,
  UpdateSubscriptionParams,
  HandleWebhookParams,
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
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams): Promise<Subscription> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  cancelSubscription = async (id: string): Promise<null> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  handleWebhook = async (payload: HandleWebhookParams): Promise<WebhookEventPayload> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };
}
