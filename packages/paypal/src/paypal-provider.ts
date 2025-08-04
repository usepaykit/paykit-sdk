import {
  $ExtWebhookHandlerConfig,
  Checkout,
  CreateCheckoutParams,
  createCheckoutSchema,
  CreateCustomerParams,
  Customer,
  PayKitProvider,
  PaykitProviderOptions,
  retrieveCheckoutSchema,
  retrieveCustomerSchema,
  retrieveSubscriptionSchema,
  Subscription,
  UpdateCustomerParams,
  UpdateSubscriptionParams,
  updateSubscriptionSchema,
  WebhookEventPayload,
} from '@paykit-sdk/core';
import { PayPalClient } from './core/paypal-client';
import { PAYPAL_ENDPOINTS } from './resources/endpoints';
import { PayPalSDKOptions } from './resources/sdk-options';

export interface PayPalConfig extends PaykitProviderOptions<PayPalSDKOptions> {}

export class PayPalProvider implements PayKitProvider {
  private _client: PayPalClient;

  constructor(options: PayPalSDKOptions) {
    this._client = new PayPalClient(options);
  }

  async createCheckout(data: CreateCheckoutParams): Promise<Checkout> {
    const { success, error } = createCheckoutSchema.safeParse(data);

    if (!success) throw new Error(error.message);

    const response = await this._client.request<Record<string, any>>({
      url: PAYPAL_ENDPOINTS.CREATE_ORDER,
      method: 'POST',
      data: {
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: data.provider_metadata?.currency ?? 'USD', value: data.provider_metadata?.amount } }],
      },
    });

    if (!response.ok) throw response.error;

    return response.value as Checkout;
  }

  retrieveCheckout = async (id: string): Promise<Checkout | null> => {
    const { success, error } = retrieveCheckoutSchema.safeParse({ id });

    if (!success) throw new Error(error.message);

    const response = await this._client.request<Record<string, any>>({
      url: PAYPAL_ENDPOINTS.GET_ORDER.replace('{id}', id),
      method: 'GET',
    });

    if (!response.ok) return null;

    return response.value as Checkout;
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    const { success, error } = retrieveCustomerSchema.safeParse({ id });

    if (!success) throw new Error(error.message);

    const response = await this._client.request<Record<string, any>>({ url: PAYPAL_ENDPOINTS.RETRIEVE_CUSTOMER.replace('{id}', id), method: 'GET' });

    if (!response.ok) throw response.error;

    return response.value as Customer;
  };

  createCustomer = async (data: CreateCustomerParams): Promise<Customer> => {
    throw new Error('Not Implemented');
  };

  updateCustomer = async (id: string, data: UpdateCustomerParams): Promise<Customer> => {
    throw new Error('Not Implemented');
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const { success, error } = retrieveSubscriptionSchema.safeParse({ id });

    if (!success) throw new Error(error.message);

    const response = await this._client.request<Record<string, any>>({
      url: PAYPAL_ENDPOINTS.RETRIEVE_SUBSCRIPTION.replace('{id}', id),
      method: 'GET',
    });

    if (!response.ok) throw response.error;

    return response.value as Subscription;
  };

  cancelSubscription = async (id: string): Promise<null> => {
    const { success, error } = retrieveSubscriptionSchema.safeParse({ id });

    if (!success) throw new Error(error.message);

    const response = await this._client.request<Record<string, any>>({
      url: PAYPAL_ENDPOINTS.CANCEL_SUBSCRIPTION.replace('{id}', id),
      method: 'POST',
    });

    if (!response.ok) throw response.error;

    return null;
  };

  updateSubscription = async (id: string, data: UpdateSubscriptionParams): Promise<Subscription> => {
    const { success, error } = updateSubscriptionSchema.safeParse({ id, ...data });

    if (!success) throw new Error(error.message);

    const response = await this._client.request<Record<string, any>>({
      url: PAYPAL_ENDPOINTS.UPDATE_SUBSCRIPTION.replace('{id}', id),
      method: 'PATCH',
      data,
    });

    if (!response.ok) throw response.error;

    return response.value as Subscription;
  };

  handleWebhook = async (payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
    const { body, headers } = payload;

    const data = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_event: body,
    };

    const response = await this._client.request<Record<string, any>>({
      url: PAYPAL_ENDPOINTS.VERIFY_WEBHOOK_SIGNATURE,
      method: 'POST',
      data,
    });

    if (!response.ok) throw response.error;

    return response.value as WebhookEventPayload;
  };
}
