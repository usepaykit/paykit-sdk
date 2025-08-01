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
import { nanoid } from 'nanoid';

export interface LocalConfig extends PaykitProviderOptions {
  apiUrl: string;
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
      type: '$checkoutCreated',
      body: JSON.stringify({ ...params, webhookUrl: this.config.apiUrl }),
    });

    const response = await unwrapAsync(this._client.post<Checkout>(`?${urlParams.toString()}`));

    return response;
  };

  retrieveCheckout = async (id: string): Promise<Checkout | null> => {
    const urlParams = new URLSearchParams({ resource: 'checkout', type: '$checkoutRetrieved', body: JSON.stringify({ id }) });

    const response = await unwrapAsync(this._client.get<Checkout>(`?${urlParams.toString()}`));

    return response;
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const customer = {
      id: `cu_${nanoid(30)}`,
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: params.metadata }),
    };

    const urlParams = new URLSearchParams({ resource: 'customer', type: '$customerCreated', body: JSON.stringify(customer) });

    const response = await unwrapAsync(this._client.post<Customer>(`?${urlParams.toString()}`));

    return response;
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    const customer = {
      id,
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: params.metadata }),
    };

    const urlParams = new URLSearchParams({ resource: 'customer', type: '$customerUpdated', body: JSON.stringify(customer) });

    const response = await unwrapAsync(this._client.put<Customer>(`?${urlParams.toString()}`));

    return response;
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    const urlParams = new URLSearchParams({ resource: 'customer', type: '$customerRetrieved', body: JSON.stringify({ id }) });

    const response = await unwrapAsync(this._client.get<Customer>(`?${urlParams.toString()}`));

    return response;
  };

  async updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    const subscription = {
      id,
      metadata: params.metadata,
    };

    const urlParams = new URLSearchParams({ resource: 'subscription', type: '$subscriptionUpdated', body: JSON.stringify(subscription) });

    const response = await unwrapAsync(this._client.put<Subscription>(`?${urlParams.toString()}`));

    return response;
  }

  async cancelSubscription(id: string): Promise<null> {
    const urlParams = new URLSearchParams({ resource: 'subscription', type: '$subscriptionCancelled', body: JSON.stringify({ id }) });

    await unwrapAsync(this._client.delete<null>(`?${urlParams.toString()}`));

    return null;
  }

  async retrieveSubscription(id: string): Promise<Subscription | null> {
    const urlParams = new URLSearchParams({ resource: 'subscription', type: '$subscriptionRetrieved', body: JSON.stringify({ id }) });

    const response = await unwrapAsync(this._client.get<Subscription>(`?${urlParams.toString()}`));

    return response;
  }

  async handleWebhook(_options: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> {
    throw new Error('handleWebhook must be called through the server export. Use: import { handleWebhook } from "@paykit-sdk/local/server"');
  }
}
