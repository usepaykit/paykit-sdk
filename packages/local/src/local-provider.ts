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
  safeEncode,
  ValidationError,
} from '@paykit-sdk/core';

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
    const checkoutWithoutId = {
      resource: 'checkout',
      customer_id: params.customer_id,
      metadata: `$t${JSON.stringify(params.metadata)}`,
      session_type: params.session_type,
      products: `$t${JSON.stringify([{ id: params.item_id, quantity: 1 }])}`,
      currency: (params.provider_metadata?.['currency'] as string) ?? 'USD',
      amount: parseInt(params.provider_metadata?.['amount'] as string, 10) ?? 25,
    };

    const checkoutId = safeEncode(checkoutWithoutId);

    if (!checkoutId.ok) throw new ValidationError('Invalid checkout ID', {});

    const urlParams = new URLSearchParams({
      ...checkoutWithoutId,
      id: checkoutId.value,
      amount: checkoutWithoutId.amount.toString(),
      payment_url: `${this.config.paymentUrl}/checkout?id=${checkoutId.value}`,
    });

    return unwrapAsync(this._client.post<Checkout>(`?${urlParams.toString()}`));
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    return unwrapAsync(this._client.get<Checkout>(`?id=${id}&resource=checkout`));
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const urlParams = new URLSearchParams({
      resource: 'customer',
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: `$t${JSON.stringify(params.metadata)}` }),
    });
    return unwrapAsync(this._client.post<Customer>(`?${urlParams.toString()}`));
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    const urlParams = new URLSearchParams({
      id,
      resource: 'customer',
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: `$t${JSON.stringify(params.metadata)}` }),
    });
    return unwrapAsync(this._client.put<Customer>(`?${urlParams.toString()}`));
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    return unwrapAsync(this._client.get<Customer>(`?id=${id}&resource=customer`));
  };

  async updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    const urlParams = new URLSearchParams({
      id,
      resource: 'subscription',
      metadata: `$t${JSON.stringify(params.metadata)}`,
    });
    return unwrapAsync(this._client.put<Subscription>(`?${urlParams.toString()}`));
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    return unwrapAsync(this._client.delete<Subscription>(`?id=${id}&resource=subscription`));
  }

  async retrieveSubscription(id: string): Promise<Subscription> {
    return unwrapAsync(this._client.get<Subscription>(`?id=${id}&resource=subscription`));
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
