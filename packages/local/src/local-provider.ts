import {
  HTTPClient,
  PayKitProvider,
  CreateCheckoutParams,
  unwrapAsync,
  Checkout,
  CreateCustomerParams,
  Customer,
  UpdateSubscriptionParams,
  Subscription,
  WebhookConfig,
  WebhookEventPayload,
  UpdateCustomerParams,
  safeEncode,
} from '@paykit-sdk/core';

export class LocalProvider implements PayKitProvider {
  private _client: HTTPClient;

  #paymentUrl = process.env.PAYKIT_PAYMENT_URL;
  #baseUrl = process.env.PAYKIT_BASE_URL!;

  constructor() {
    this._client = new HTTPClient({ baseUrl: this.#baseUrl, headers: {} });
  }

  createCheckout = async (params: CreateCheckoutParams) => {
 

    const response = unwrapAsync(this._client.post<Checkout>('checkouts', { body: JSON.stringify(params) }));
    return response;
  };

  retrieveCheckout = async (id: string) => {
    const response = unwrapAsync(this._client.get<Checkout>(`checkouts/${id}`));
    return response;
  };

  createCustomer = async (params: CreateCustomerParams) => {
    const response = unwrapAsync(this._client.post<Customer>('customers', { body: JSON.stringify(params) }));
    return response;
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    const response = unwrapAsync(this._client.put<Customer>(`customers/${id}`, { body: JSON.stringify(params) }));
    return response;
  };

  retrieveCustomer = async (id: string) => {
    const response = unwrapAsync(this._client.get<Customer>(`customers/${id}`));
    return response;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams) => {
    const response = unwrapAsync(this._client.put<Subscription>(`subscriptions/${id}`, { body: JSON.stringify(params) }));
    return response;
  };

  cancelSubscription = async (id: string) => {
    const response = unwrapAsync(this._client.delete<Subscription>(`subscriptions/${id}`));
    return response;
  };

  retrieveSubscription = async (id: string) => {
    const response = unwrapAsync(this._client.get<Subscription>(`subscriptions/${id}`));
    return response;
  };

  handleWebhook = async (payload: WebhookConfig) => {
    const response = unwrapAsync(this._client.post<WebhookEventPayload>(`webhooks`, { body: JSON.stringify(payload) }));
    return response;
  };
}
