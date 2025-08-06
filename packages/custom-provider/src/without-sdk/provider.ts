import {
  createCheckoutSchema,
  createCustomerSchema,
  Customer,
  HTTPClient,
  PayKitProvider,
  retrieveCheckoutSchema,
  retrieveCustomerSchema,
  retrieveSubscriptionSchema,
  Subscription,
  UpdateCustomerParams,
  UpdateSubscriptionParams,
  updateCustomerSchema,
  updateSubscriptionSchema,
  WebhookEventPayload,
  $ExtWebhookHandlerConfig,
} from '@paykit-sdk/core';
import { CreateCheckoutParams, CreateCustomerParams } from '@paykit-sdk/core';
import { Checkout } from '@paykit-sdk/core';

export interface WithoutProviderSDKOptions {
  apiKey: string;
}

export class WithoutProviderSDK implements PayKitProvider {
  private _client: HTTPClient;

  constructor(private readonly opts: WithoutProviderSDKOptions) {
    this._client = new HTTPClient({
      baseUrl: 'https://api.your-provider.com',
      headers: {
        'x-api-key': opts.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { error, data } = createCheckoutSchema.safeParse(params);

    if (error) throw new Error(error.message);

    const checkout = await this._client.post<Record<string, unknown>>('/checkouts', { body: JSON.stringify(data) });

    if (!checkout.ok) throw new Error('Failed to create checkout');

    return checkout.value as Checkout;
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const { error } = retrieveCheckoutSchema.safeParse({ id });

    if (error) throw new Error(error.message);

    const checkout = await this._client.get<Record<string, unknown>>(`/checkouts/${id}`);

    if (!checkout.ok) throw new Error('Failed to retrieve checkout');

    return checkout.value as Checkout;
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const { error, data } = createCustomerSchema.safeParse(params);

    if (error) throw new Error(error.message);

    const customer = await this._client.post<Record<string, unknown>>('/customers', { body: JSON.stringify(data) });

    if (!customer.ok) throw new Error('Failed to create customer');

    return customer.value as unknown as Customer;
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    const { error } = retrieveCustomerSchema.safeParse({ id });

    if (error) throw new Error(error.message);

    const customer = await this._client.get<Record<string, unknown>>(`/customers/${id}`);

    if (!customer.ok) throw new Error('Failed to retrieve customer');

    return customer.value as unknown as Customer;
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const { error, data } = updateCustomerSchema.safeParse({ id, ...params });

    if (error) throw new Error(error.message);

    const customer = await this._client.put<Record<string, unknown>>(`/customers/${id}`, { body: JSON.stringify(data) });

    if (!customer.ok) throw new Error('Failed to update customer');

    return customer.value as unknown as Customer;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams): Promise<Subscription> => {
    const { error, data } = updateSubscriptionSchema.safeParse({
      id,
      ...params,
    });

    if (error) throw new Error(error.message);

    const subscription = await this._client.put<Record<string, unknown>>(`/subscriptions/${id}`, { body: JSON.stringify(data) });

    if (!subscription.ok) throw new Error('Failed to update subscription');

    return subscription.value as unknown as Subscription;
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) throw new Error(error.message);

    const subscription = await this._client.get<Record<string, unknown>>(`/subscriptions/${id}`);

    if (!subscription.ok) throw new Error('Failed to retrieve subscription');

    return subscription.value as unknown as Subscription;
  };

  cancelSubscription = async (id: string): Promise<null> => {
    // TODO: Add validation, currently working on adding validation schema to the SDK

    const subscription = await this._client.delete<Record<string, unknown>>(`/subscriptions/${id}`);

    if (!subscription.ok) throw new Error('Failed to cancel subscription');

    return null;
  };

  handleWebhook = async (payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
    throw new Error('Method not implemented.');
  };
}
