import {
  PayKitProvider,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionSchema,
  unwrapAsync,
  HandleWebhookParams,
  WebhookEventPayload,
  PaykitProviderOptions,
  HTTPClient,
} from '@paykit-sdk/core';

export interface GumroadConfig extends PaykitProviderOptions<{ accessToken: string }> {}

export class GumroadProvider implements PayKitProvider {
  private _client: HTTPClient;

  constructor(private config: GumroadConfig) {
    this._client = new HTTPClient({ baseUrl: 'https://api.gumroad.com/v2', headers: { Authorization: `Bearer ${config.accessToken}` } });
  }

  readonly providerName = 'gumroad';

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const response = await unwrapAsync(this._client.post<{ url: string }>('checkouts', { body: JSON.stringify(params) }));

    return {
      id: 'id',
      amount: 100,
      currency: 'USD',
      customer_id: 'customer_id',
      metadata: {},
      payment_url: response.url,
      session_type: 'one_time',
      products: [],
    };
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    throw new Error('Not implemented');
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new Error('Not implemented');
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new Error('Not implemented');
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    throw new Error('Not implemented');
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    throw new Error('Not implemented');
  };

  cancelSubscription = async (id: string): Promise<null> => {
    throw new Error('Not implemented');
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    throw new Error('Not implemented');
  };

  handleWebhook = async (payload: HandleWebhookParams): Promise<WebhookEventPayload> => {
    throw new Error('Not implemented');
  };
}
