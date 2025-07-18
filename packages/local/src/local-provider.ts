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
  CheckoutCreated,
  CustomerCreated,
  CustomerUpdated,
  SubscriptionUpdated,
  safeDecode,
  SubscriptionCanceled,
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
    const checkoutWithoutIdAndPaymentUrl = {
      resource: 'checkout',
      customer_id: params.customer_id,
      metadata: params.metadata,
      session_type: params.session_type,
      products: [{ id: params.item_id, quantity: 1 }],
      currency: (params.provider_metadata?.['currency'] as string) ?? 'USD',
      amount: parseInt(params.provider_metadata?.['amount'] as string, 10) ?? 25,
    } as Omit<Checkout, 'id' | 'payment_url'>;

    const checkoutId = safeEncode(checkoutWithoutIdAndPaymentUrl);

    if (!checkoutId.ok) throw new ValidationError('Invalid checkout ID', {});

    const urlParams = {
      ...checkoutWithoutIdAndPaymentUrl,
      resource: 'webhook',
      id: checkoutId.value,
      amount: checkoutWithoutIdAndPaymentUrl.amount.toString(),
      metadata: `$t${JSON.stringify(checkoutWithoutIdAndPaymentUrl.metadata)}`,
      payment_url: `${this.config.paymentUrl}/checkout?id=${checkoutId.value}`,
      products: `$t${JSON.stringify(checkoutWithoutIdAndPaymentUrl.products)}`,
    };

    /**
     * Send webhook
     */
    await unwrapAsync(this._client.post<CheckoutCreated>(`?${urlParams.toString()}`));

    const checkout = { ...checkoutWithoutIdAndPaymentUrl, id: checkoutId.value, payment_url: urlParams.payment_url };

    return checkout;
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    throw new Error('Not implemented');
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const customerWithoutId = {
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: params.metadata }),
    };

    const customerId = safeEncode({ name: customerWithoutId.name, email: customerWithoutId.email });

    if (!customerId.ok) throw new ValidationError('Invalid customer data', {});

    const urlParams = new URLSearchParams({
      ...customerWithoutId,
      metadata: `$t${JSON.stringify(customerWithoutId.metadata)}`,
      id: customerId.value,
      resource: 'customer',
    });

    /**
     * Send Webhook
     */
    await unwrapAsync(this._client.post<CustomerCreated>(`?${urlParams.toString()}`));

    const customer = { ...customerWithoutId, id: customerId.value };

    return customer;
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    const customerWithoutId = {
      ...(params.name && { name: params.name }),
      ...(params.email && { email: params.email }),
      ...(params.metadata && { metadata: params.metadata }),
    };

    /**
     * Ignores the ID and makes a new one based on the updated values.
     */
    const retUpdateId = safeEncode({ name: params.name, email: params.email });

    if (!retUpdateId.ok) throw new ValidationError('Invalid Customer data', {});

    const urlParams = new URLSearchParams({
      ...customerWithoutId,
      metadata: `$t${JSON.stringify(customerWithoutId.metadata)}`,
      id: retUpdateId.value,
      resource: 'customer',
    });

    /**
     * Send Webhook
     */
    await unwrapAsync(this._client.put<CustomerUpdated>(`?${urlParams.toString()}`));

    const customer = { ...customerWithoutId, id: retUpdateId.value };

    return customer;
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    throw new Error('Not implemented');
  };

  async updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    const urlParams = new URLSearchParams({ id, resource: 'subscription', metadata: `$t${JSON.stringify(params.metadata)}` });

    /**
     * Send Webhook
     */
    await unwrapAsync(this._client.put<SubscriptionUpdated>(`?${urlParams.toString()}`));

    const customerId$ = safeDecode<Record<string, any>>(id);

    if (!customerId$) throw new Error('Invalid subscription to update');

    const customerId = customerId$.value?.['customerId'] as string;

    return { ...params, id, status: 'active', current_period_start: new Date(), current_period_end: new Date(), customer_id: customerId };
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const urlParams = new URLSearchParams({ resource: 'webhook', id });

    /**
     * Send Webhook
     */
    await unwrapAsync(this._client.delete<SubscriptionCanceled>(`?${urlParams.toString()}`));
    return { id } as any;
  }

  async retrieveSubscription(id: string): Promise<Subscription> {
    throw new Error('Not implemented');
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
