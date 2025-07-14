import {
  PayKitProvider,
  CreateCheckoutParams,
  CreateCustomerParams,
  UpdateSubscriptionParams,
  Subscription,
  $ExtWebhookHandlerConfig,
  UpdateCustomerParams,
  PaykitProviderOptions,
  Checkout,
  Customer,
  WebhookEventPayload,
  HTTPClient,
  unwrapAsync,
} from '@paykit-sdk/core';

export interface LocalConfig extends PaykitProviderOptions {
  /**
   * API URL for the local development server
   * The plugin handles server-side operations via HTTP requests
   */
  apiUrl: string;

  /**
   * Payment URL for checkout redirects
   */
  paymentUrl: string;
}

export class LocalProvider implements PayKitProvider {
  private _client: HTTPClient;

  constructor(private config: LocalConfig) {
    this._client = new HTTPClient({ baseUrl: config.apiUrl, headers: { 'Content-Type': 'application/json' } });
  }

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    return unwrapAsync(
      this._client.post<Checkout>(new URLSearchParams({ resource: 'checkout' }).toString(), {
        body: JSON.stringify({ ...params, paymentUrl: this.config.paymentUrl }),
      }),
    );
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    return unwrapAsync(this._client.get<Checkout>(new URLSearchParams({ resource: 'checkout', id }).toString()));
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    return unwrapAsync(this._client.post<Customer>(new URLSearchParams({ resource: 'customer' }).toString(), { body: JSON.stringify(params) }));
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    return unwrapAsync(this._client.put<Customer>(new URLSearchParams({ resource: 'customer', id }).toString(), { body: JSON.stringify(params) }));
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    return unwrapAsync(this._client.get<Customer>(new URLSearchParams({ resource: 'customer', id }).toString()));
  };

  async updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    return unwrapAsync(this._client.put<Subscription>(new URLSearchParams({ resource: 'subscription', id }).toString(), { body: JSON.stringify(params) }));
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    return unwrapAsync(this._client.delete<Subscription>(new URLSearchParams({ resource: 'subscription', id }).toString()));
  }

  async retrieveSubscription(id: string): Promise<Subscription> {
    return unwrapAsync(this._client.get<Subscription>(new URLSearchParams({ resource: 'subscription', id }).toString()));
  }

  async handleWebhook(payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> {
    return unwrapAsync(
      this._client.post<WebhookEventPayload>(new URLSearchParams({ resource: 'webhook' }).toString(), { body: JSON.stringify(payload) }),
    );
  }
}
