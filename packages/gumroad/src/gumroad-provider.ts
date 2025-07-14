import {
  PayKitProvider,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionParams,
  unwrapAsync,
  $ExtWebhookHandlerConfig,
  WebhookEventPayload,
  UnknownError,
  PaykitProviderOptions,
  HTTPClient,
} from '@paykit-sdk/core';

export interface GumroadConfig extends PaykitProviderOptions<{ accessToken: string }> {}

export class GumroadProvider implements PayKitProvider {
  private _client: HTTPClient;

  constructor(private config: GumroadConfig) {
    this._client = new HTTPClient({ baseUrl: 'https://api.gumroad.com/v2', headers: { Authorization: `Bearer ${config.accessToken}` } });
  }

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

  cancelSubscription = async (id: string): Promise<Subscription> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };

  handleWebhook = async (payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
    throw new UnknownError('Not implemented', { cause: 'Not Implemented' });
  };
}
