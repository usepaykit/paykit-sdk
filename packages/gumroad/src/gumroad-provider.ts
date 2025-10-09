import {
  PayKitProvider,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionSchema,
  unwrapAsync,
  HandleWebhookParams,
  WebhookEventPayload,
  PaykitProviderOptions,
  HTTPClient,
  CreatePaymentSchema,
  CreateRefundSchema,
  CreateSubscriptionSchema,
  Payment,
  Refund,
  UpdateCheckoutParams,
  UpdatePaymentSchema,
} from '@paykit-sdk/core';

export interface GumroadConfig extends PaykitProviderOptions<{ accessToken: string }> {}

export class GumroadProvider implements PayKitProvider {
  private _client: HTTPClient;

  constructor(private config: GumroadConfig) {
    this._client = new HTTPClient({ baseUrl: 'https://api.gumroad.com/v2', headers: { Authorization: `Bearer ${config.accessToken}` } });
  }
  updateCheckout = async (id: string, params: UpdateCheckoutParams): Promise<Checkout> => {
    throw new Error('Method not implemented.');
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new Error('Method not implemented.');
  };

  deleteCustomer = async (id: string): Promise<null> => {
    throw new Error('Method not implemented.');
  };

  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    throw new Error('Method not implemented.');
  };

  deleteSubscription = async (id: string): Promise<null> => {
    throw new Error('Method not implemented.');
  };

  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    throw new Error('Method not implemented.');
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    throw new Error('Method not implemented.');
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    throw new Error('Method not implemented.');
  };

  deletePayment = async (id: string): Promise<null> => {
    throw new Error('Method not implemented.');
  };

  capturePayment = async (id: string): Promise<Payment> => {
    throw new Error('Method not implemented.');
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    throw new Error('Method not implemented.');
  };

  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    throw new Error('Method not implemented.');
  };

  readonly providerName = 'gumroad';

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const response = await unwrapAsync(this._client.post<{ url: string }>('checkouts', { body: JSON.stringify(params) }));

    return {
      id: 'id',
      amount: 100,
      currency: 'USD',
      customer: 'customer_id',
      metadata: {},
      payment_url: response.url,
      session_type: 'one_time',
      products: [],
    };
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    throw new Error('Not implemented');
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new Error('Not implemented');
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new Error('Not implemented');
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    throw new Error('Not implemented');
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    throw new Error('Not implemented');
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    throw new Error('Not implemented');
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    throw new Error('Not implemented');
  };

  handleWebhook = async (payload: HandleWebhookParams): Promise<Array<WebhookEventPayload>> => {
    throw new Error('Not implemented');
  };
}
