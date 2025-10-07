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
  UpdateSubscriptionSchema,
  WebhookEventPayload,
  HandleWebhookParams,
  validateRequiredKeys,
  CreatePaymentSchema,
  CreateRefundSchema,
  CreateSubscriptionSchema,
  Payment,
  Refund,
  UpdateCheckoutParams,
  UpdatePaymentSchema,
  createRefundSchema,
  createPaymentSchema,
} from '@paykit-sdk/core';
import { CreateCheckoutParams, CreateCustomerParams } from '@paykit-sdk/core';
import { Checkout } from '@paykit-sdk/core';
import _ from 'lodash';
import { isComgateError, paykitPayment$InboundSchema } from './utils';

export interface ComgateConfig {
  /**
   * The merchant ID
   */
  merchant: string;

  /**
   * The secret key
   */
  secret: string;

  /**
   * Whether to use the sandbox environment
   */
  sandbox: boolean;
}

export class ComgateProvider implements PayKitProvider {
  readonly providerName = 'comgate';

  private _client: HTTPClient;

  private readonly baseUrl = 'https://payments.comgate.cz';

  constructor(private readonly opts: ComgateConfig) {
    this._client = new HTTPClient({
      baseUrl: this.baseUrl,
      headers: {
        Authorization: `Basic ${Buffer.from(opts.merchant + ':' + opts.secret).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Create checkout session using Comgate's /create endpoint
   * Maps to: POST /v2.0/create (https://apidoc.comgate.cz/en/api/rest/#operation/v2-0-create)
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { error, data } = createCheckoutSchema.safeParse(params);

    if (error) throw new Error(error.message);

    const providerMetadata = validateRequiredKeys(
      ['price', 'email', 'currency', 'label'],
      (params.provider_metadata ?? {}) as Record<string, string | undefined>,
      'Missing required provider metadata: {keys}',
    );

    const { price, email, currency, label = 'Untitled Checkout', ...restMetadata } = providerMetadata;

    const requestBody = new URLSearchParams({
      code: '0',
      test: this.opts.sandbox ? 'true' : 'false',
      refId: params.item_id,
      payerId: params.customer_id,
      price,
      email,
      curr: currency,
      label,
      ..._.mapValues(restMetadata, value => JSON.stringify(value)),
    });

    const response = await this._client.post<Record<string, any>>(`/v2.0/paymentRedirect/merchant/${this.opts.merchant}`, {
      body: requestBody.toString(),
    });

    if (isComgateError(response)) {
      throw new Error(`Failed to create checkout: ${response['value']?.message || 'Unknown error'}`);
    }

    return response.value as Checkout;
  };

  updateCheckout = async (id: string, params: UpdateCheckoutParams): Promise<Checkout> => {
    throw new Error('Comgate does not support updating checkouts');
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new Error('Comgate does not support deleting checkouts');
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    throw new Error('Comgate does not support retrieving checkouts, use the payment API instead');
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new Error('Comgate does not support creating customers');
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    throw new Error('Comgate does not support retrieving customers');
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new Error('Comgate does not support updating customers');
  };

  deleteCustomer = async (id: string): Promise<null> => {
    throw new Error('Comgate does not support deleting customers');
  };

  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const { error, data } = createPaymentSchema.safeParse(params);

    if (error) throw new Error(error.message.split('\n').join(' '));

    const providerMetadata = validateRequiredKeys(
      ['email', 'label', 'refId'],
      (params.provider_metadata ?? {}) as Record<string, string | undefined>,
      'Missing required provider metadata: {keys}',
    );

    const { email, label = 'Untitled Payment', refId, ...restMetadata } = providerMetadata;

    const requestBody = new URLSearchParams({
      code: '0',
      test: this.opts.sandbox ? 'true' : 'false',
      refId,
      payerId: params.customer_id,
      price: String(data.amount),
      email,
      curr: String(data.currency),
      label: String(label),
      ...(restMetadata as Record<string, string>),
    });

    const response = await this._client.post<Record<string, any>>('/v2.0/create.json', {
      body: requestBody.toString(),
    });

    if (isComgateError(response)) {
      throw new Error(`Failed to create payment: ${response['value']?.message || 'Unknown error'}`);
    }

    return paykitPayment$InboundSchema({ ...data, status: 'pending' }, response.value!);
  };

  updatePayment = async (_id: string, _params: UpdatePaymentSchema): Promise<Payment> => {
    throw new Error('Comgate does not support payment updates');
  };

  deletePayment = async (id: string): Promise<null> => {
    const response = await this._client.delete(`/v2.0/payment/${id}.json`);

    if (isComgateError(response)) {
      throw new Error(`Failed to delete payment: ${(response['value'] as Record<string, unknown>)?.message || 'Unknown error'}`);
    }

    return null;
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    const { error } = createPaymentSchema.safeParse({ id });
    if (error) throw new Error(`Payment retrieval validation failed: ${error.message}`);

    const response = await this._client.get<Record<string, any>>(`/v2.0/payment/${id}.json`);

    if (isComgateError(response)) {
      throw new Error(`Failed to retrieve payment: ${response['value']?.message || 'Unknown error'}`);
    }

    return response.value as unknown as Payment;
  };

  capturePayment = async (id: string): Promise<Payment> => {
    const response = await this._client.post<Record<string, any>>(`/v2.0/preauth/${id}/confirm.json`, {});

    if (isComgateError(response)) {
      throw new Error(`Failed to capture payment: ${response['value']?.message || 'Unknown error'}`);
    }

    return response.value as unknown as Payment;
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    const response = await this._client.delete<Record<string, any>>(`/v2.0/payment/transId/${id}.json`, {});

    if (isComgateError(response)) {
      throw new Error(`Failed to cancel payment: ${response['value']?.message || 'Unknown error'}`);
    }

    return response.value as unknown as Payment;
  };

  /**
   * Creates a refund for a paid payment
   */
  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    const { error, data } = createRefundSchema.safeParse(params);

    if (error) throw new Error(error.message);

    const requestBody = new URLSearchParams({
      transId: data.payment_id,
      amount: String(data.amount),
      test: this.opts.sandbox ? 'true' : 'false',
      ...(data.reason && { refId: data.reason }),
    });

    const response = await this._client.post<Record<string, any>>('/v2.0/refund.json', {
      body: requestBody.toString(),
    });

    if (isComgateError(response)) {
      throw new Error(`Failed to create refund: ${response['value']?.message || 'Unknown error'}`);
    }

    return response.value as unknown as Refund;
  };

  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    throw new Error('Comgate does not support creating subscriptions');
  };

  deleteSubscription = async (id: string): Promise<null> => {
    throw new Error('Comgate does not support deleting subscriptions');
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    throw new Error('Comgate does not support updating subscriptions');
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    throw new Error('Comgate does not support retrieving subscriptions');
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    throw new Error('Comgate does not support canceling subscriptions');
  };

  handleWebhook = async (payload: HandleWebhookParams): Promise<WebhookEventPayload> => {
    const body = JSON.parse(payload.body) as Record<string, unknown>;

    if (!body || typeof body !== 'object') {
      throw new Error('Invalid webhook payload');
    }

    const { merchant, secret, transId, status } = validateRequiredKeys(
      ['merchant', 'secret', 'transId', 'status'],
      body as Record<string, string | undefined>,
      'Missing required webhook parameters: {keys}',
    );

    if (secret !== this.opts.secret) {
      throw new Error('Webhook secret mismatched');
    }

    if (merchant !== this.opts.merchant) {
      throw new Error('Invalid merchant ID in webhook - merchant mismatch');
    }

    const verifyResponse = await this._client.post<Record<string, any>>('/v1.0/status', {
      body: new URLSearchParams({ merchant: this.opts.merchant, transId, secret: this.opts.secret }).toString(),
    });

    if (isComgateError(verifyResponse)) {
      throw new Error(`Failed to verify webhook: ${verifyResponse['value']?.message || 'Unknown error'}`);
    }

    const verifiedStatus = verifyResponse.value?.status;

    if (!verifiedStatus) {
      throw new Error('Failed to verify webhook: no status returned');
    }

    if (verifiedStatus !== status) {
      throw new Error(`Webhook status mismatch: received ${status}, verified ${verifiedStatus}`);
    }

    const statusMap: Record<string, string> = {
      PAID: 'payment.completed',
      CANCELLED: 'payment.cancelled',
      AUTHORIZED: 'payment.authorized',
      PENDING: 'payment.pending',
    };

    console.log({ status: statusMap[verifiedStatus], body });

    return verifyResponse.value as WebhookEventPayload;
  };
}
