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
  WebhookEvent,
} from '@paykit-sdk/core';
import { nanoid } from 'nanoid';

export interface LocalConfig extends PaykitProviderOptions {
  webhookUrl: string;
  paymentUrl: string;
}

export class LocalProvider implements PayKitProvider {
  private _client: HTTPClient;

  constructor(private config: LocalConfig) {
    this._client = new HTTPClient({ baseUrl: config.webhookUrl, headers: {} });
  }

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const urlParams = new URLSearchParams({
      resource: 'checkout',
      type: '$checkoutCreated',
      body: JSON.stringify({ ...params, paymentUrl: this.config.paymentUrl, webhookUrl: this.config.webhookUrl }),
    });

    const response = await unwrapAsync(this._client.post<WebhookEvent<Checkout>>(`?${urlParams.toString()}`));

    return response.data;
  };

  retrieveCheckout = async (id: string): Promise<Checkout | null> => {
    const urlParams = new URLSearchParams({ resource: 'checkout', type: '$checkoutRetrieved', body: JSON.stringify({ id }) });

    const response = await unwrapAsync(this._client.post<WebhookEvent<Checkout>>(`?${urlParams.toString()}`));

    return response.data;
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const customer = {
      id: `cu_${nanoid(30)}`,
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: params.metadata }),
    };

    const urlParams = new URLSearchParams({ resource: 'customer', type: '$customerCreated', body: JSON.stringify(customer) });

    const response = await unwrapAsync(this._client.post<WebhookEvent<Customer>>(`?${urlParams.toString()}`));

    return response.data;
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const customer = {
      id,
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: params.metadata }),
    };

    const urlParams = new URLSearchParams({ resource: 'customer', type: '$customerUpdated', body: JSON.stringify(customer) });

    const response = await unwrapAsync(this._client.post<WebhookEvent<Customer>>(`?${urlParams.toString()}`));

    return response.data;
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    const urlParams = new URLSearchParams({ resource: 'customer', type: '$customerRetrieved', body: JSON.stringify({ id }) });

    const response = await unwrapAsync(this._client.post<WebhookEvent<Customer>>(`?${urlParams.toString()}`));

    return response.data;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams): Promise<Subscription> => {
    const subscription = { id, ...params };

    const urlParams = new URLSearchParams({ resource: 'subscription', type: '$subscriptionUpdated', body: JSON.stringify(subscription) });

    const response = await unwrapAsync(this._client.post<WebhookEvent<Subscription>>(`?${urlParams.toString()}`));

    return response.data;
  };

  cancelSubscription = async (id: string): Promise<null> => {
    const urlParams = new URLSearchParams({ resource: 'subscription', type: '$subscriptionCancelled', body: JSON.stringify({ id }) });

    await unwrapAsync(this._client.post<null>(`?${urlParams.toString()}`));

    return null;
  };

  retrieveSubscription = async (id: string): Promise<Subscription | null> => {
    const urlParams = new URLSearchParams({ resource: 'subscription', type: '$subscriptionRetrieved', body: JSON.stringify({ id }) });

    const response = await unwrapAsync(this._client.post<WebhookEvent<Subscription>>(`?${urlParams.toString()}`));

    return response.data;
  };

  handleWebhook = async (_options: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
    throw new Error('handleWebhook must be called through the server export. Use: import { handleWebhook } from "@paykit-sdk/local/server"');
  };
}
