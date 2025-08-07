import {
  HandleWebhookParams,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  PayKitProvider,
  PaykitProviderOptions,
  Subscription,
  UpdateCustomerParams,
  UpdateSubscriptionParams,
  WebhookEventPayload,
} from '@paykit-sdk/core';

export interface WithProviderSDKOptions extends PaykitProviderOptions<{ apiKey: string }> {}

export class WithProviderSDK implements PayKitProvider {
  constructor(private readonly opts: WithProviderSDKOptions) {}

  createCheckout(checkout: CreateCheckoutParams): Promise<Checkout> {
    throw new Error('Method not implemented.');
  }

  retrieveCheckout(id: string): Promise<Checkout> {
    throw new Error('Method not implemented.');
  }

  createCustomer(params: CreateCustomerParams): Promise<Customer> {
    throw new Error('Method not implemented.');
  }

  retrieveCustomer(id: string): Promise<Customer> {
    throw new Error('Method not implemented.');
  }

  updateCustomer(id: string, params: UpdateCustomerParams): Promise<Customer> {
    throw new Error('Method not implemented.');
  }

  updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  retrieveSubscription(id: string): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  cancelSubscription(id: string): Promise<null> {
    throw new Error('Method not implemented.');
  }

  handleWebhook(payload: HandleWebhookParams): Promise<WebhookEventPayload> {
    throw new Error('Method not implemented.');
  }
}
