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
    this._client = new HTTPClient({ baseUrl: config.apiUrl, headers: {} });
  }

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const urlParams = new URLSearchParams({
      resource: 'checkout',
      customer_id: params.customer_id,
      session_type: params.session_type,
      item_id: params.item_id,
      paymentUrl: this.config.paymentUrl,
      metadata: `$t${JSON.stringify(params.metadata)}`,
      ...(params.provider_metadata && { provider_metadata: `$t${JSON.stringify(params.provider_metadata)}` }),
    });

    return unwrapAsync(this._client.post<Checkout>(`?${urlParams.toString()}`));
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const urlParams = new URLSearchParams({ resource: 'checkout', id });
    return unwrapAsync(this._client.get<Checkout>(`?${urlParams.toString()}`));
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const urlParams = new URLSearchParams({
      resource: 'customer',
      ...(params.email && { email: params.email }),
      ...(params.name && { name: params.name }),
      ...(params.metadata && { metadata: `$t${JSON.stringify(params.metadata)}` }),
    });
    return unwrapAsync(this._client.post<Customer>(`?${urlParams.toString()}`));
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    const urlParams = new URLSearchParams({
      resource: 'customer',
      id,
      ...(params.email && { email: params.email }),
      ...(params.name && { name: params.name }),
      ...(params.metadata && { metadata: `$t${JSON.stringify(params.metadata)}` }),
    });
    return unwrapAsync(this._client.put<Customer>(`?${urlParams.toString()}`));
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    const urlParams = new URLSearchParams({ resource: 'customer', id });
    return unwrapAsync(this._client.get<Customer>(`?${urlParams.toString()}`));
  };

  async updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    const urlParams = new URLSearchParams({
      resource: 'subscription',
      id,
      metadata: `$t${JSON.stringify(params.metadata)}`,
    });
    return unwrapAsync(this._client.put<Subscription>(`?${urlParams.toString()}`));
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const urlParams = new URLSearchParams({ resource: 'subscription', id });
    return unwrapAsync(this._client.delete<Subscription>(`?${urlParams.toString()}`));
  }

  async retrieveSubscription(id: string): Promise<Subscription> {
    const urlParams = new URLSearchParams({ resource: 'subscription', id });
    return unwrapAsync(this._client.get<Subscription>(`?${urlParams.toString()}`));
  }

  async handleWebhook(payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> {
    const urlParams = new URLSearchParams({
      resource: 'webhook',
      body: payload.body,
      webhookSecret: payload.webhookSecret,
      headers: `$t${JSON.stringify(payload.headers)}`,
    });
    return unwrapAsync(this._client.post<WebhookEventPayload>(`?${urlParams.toString()}`));
  }
}
