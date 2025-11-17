import {
  AbstractPayKitProvider,
  Checkout,
  CreateCheckoutSchema,
  CreateCustomerParams,
  Customer,
  HTTPClient,
  PayKitProvider,
  PaykitProviderOptions,
  ProviderNotSupportedError,
  schema,
  UpdateCheckoutSchema,
  UpdateCustomerParams,
  CreateSubscriptionSchema,
  Subscription,
  UpdateSubscriptionSchema,
  CreatePaymentSchema,
  Payment,
  UpdatePaymentSchema,
  CapturePaymentSchema,
  CreateRefundSchema,
  Refund,
  HandleWebhookParams,
  WebhookEventPayload,
} from '@paykit-sdk/core';
import { z } from 'zod';

export interface MoniepointOptions extends PaykitProviderOptions {
  /**
   * The public key for the Moniepoint API
   */
  publicKey: string;

  /**
   * The secret key for the Moniepoint API
   */
  secretKey: string;

  /**
   * Whether to use the sandbox environment
   */
  isSandbox: boolean;
}

const moniepointOptionsSchema = schema<MoniepointOptions>()(
  z.object({
    publicKey: z.string(),
    secretKey: z.string(),
    isSandbox: z.boolean(),
  }),
);

const providerName = 'moniepoint';

export class MoniepointProvider extends AbstractPayKitProvider implements PayKitProvider {
  readonly providerName = providerName;

  private _client: HTTPClient;
  private baseUrl: string;

  constructor(private readonly opts: MoniepointOptions) {
    super(moniepointOptionsSchema, opts, providerName);

    const debug = opts.debug ?? true;

    this.baseUrl = opts.isSandbox
      ? 'https://sandbox.moniepoint.com/api'
      : 'https://api.moniepoint.com/api';

    this._client = new HTTPClient({
      baseUrl: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': opts.publicKey,
        'X-Secret-Key': opts.secretKey,
      },
      retryOptions: { max: 3, baseDelay: 1000, debug },
    });
  }

  createCheckout = async (params: CreateCheckoutSchema): Promise<Checkout> => {
    throw new ProviderNotSupportedError('createCheckout', 'Moniepoint', {
      reason: 'Moniepoint does not support creating checkouts',
      alternative: 'Use the createPayment method instead',
    });
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    throw new ProviderNotSupportedError('retrieveCheckout', 'Moniepoint', {
      reason: 'Moniepoint does not support retrieving checkouts',
      alternative: 'Use the retrievePayment method instead',
    });
  };

  updateCheckout = async (
    id: string,
    params: UpdateCheckoutSchema,
  ): Promise<Checkout> => {
    throw new ProviderNotSupportedError('updateCheckout', 'Moniepoint', {
      reason: 'Moniepoint does not support updating checkouts',
      alternative: 'Use the updatePayment method instead',
    });
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteCheckout', 'Moniepoint', {
      reason: 'Moniepoint does not support deleting checkouts',
      alternative: 'Use the deletePayment method instead',
    });
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new ProviderNotSupportedError('createCustomer', 'Moniepoint', {
      reason: 'Moniepoint does not support creating customers',
      alternative: 'Use the createCustomer method instead',
    });
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    throw new ProviderNotSupportedError('retrieveCustomer', 'Moniepoint', {
      reason: 'Moniepoint does not support retrieving customers',
      alternative: 'Use the retrieveCustomer method instead',
    });
  };

  updateCustomer = async (
    id: string,
    params: UpdateCustomerParams,
  ): Promise<Customer> => {
    throw new ProviderNotSupportedError('updateCustomer', 'Moniepoint', {
      reason: 'Moniepoint does not support updating customers',
      alternative: 'Use the updateCustomer method instead',
    });
  };

  deleteCustomer = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteCustomer', 'Moniepoint', {
      reason: 'Moniepoint does not support deleting customers',
      alternative: 'Use the deleteCustomer method instead',
    });
  };

  createSubscription = async (
    params: CreateSubscriptionSchema,
  ): Promise<Subscription> => {
    throw new ProviderNotSupportedError('createSubscription', 'Moniepoint', {
      reason: 'Moniepoint does not support creating subscriptions',
      alternative: 'Use the createSubscription method instead',
    });
  };

  updateSubscription = async (
    id: string,
    params: UpdateSubscriptionSchema,
  ): Promise<Subscription> => {
    throw new ProviderNotSupportedError('updateSubscription', 'Moniepoint', {
      reason: 'Moniepoint does not support updating subscriptions',
      alternative: 'Use the updateSubscription method instead',
    });
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    throw new ProviderNotSupportedError('cancelSubscription', 'Moniepoint', {
      reason: 'Moniepoint does not support canceling subscriptions',
      alternative: 'Use the cancelSubscription method instead',
    });
  };

  deleteSubscription = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteSubscription', 'Moniepoint', {
      reason: 'Moniepoint does not support deleting subscriptions',
      alternative: 'Use the deleteSubscription method instead',
    });
  };

  retrieveSubscription = async (id: string): Promise<Subscription | null> => {
    throw new ProviderNotSupportedError('retrieveSubscription', 'Moniepoint', {
      reason: 'Moniepoint does not support retrieving subscriptions',
      alternative: 'Use the retrieveSubscription method instead',
    });
  };

  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    throw new ProviderNotSupportedError('createPayment', 'Moniepoint', {
      reason: 'Moniepoint does not support creating payments',
      alternative: 'Use the createPayment method instead',
    });
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    throw new ProviderNotSupportedError('retrievePayment', 'Moniepoint', {
      reason: 'Moniepoint does not support retrieving payments',
      alternative: 'Use the retrievePayment method instead',
    });
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    throw new ProviderNotSupportedError('updatePayment', 'Moniepoint', {
      reason: 'Moniepoint does not support updating payments',
      alternative: 'Use the updatePayment method instead',
    });
  };

  deletePayment = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deletePayment', 'Moniepoint', {
      reason: 'Moniepoint does not support deleting payments',
      alternative: 'Use the deletePayment method instead',
    });
  };

  capturePayment = async (id: string, params: CapturePaymentSchema): Promise<Payment> => {
    throw new ProviderNotSupportedError('capturePayment', 'Moniepoint', {
      reason: 'Moniepoint does not support capturing payments',
      alternative: 'Use the capturePayment method instead',
    });
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    throw new ProviderNotSupportedError('cancelPayment', 'Moniepoint', {
      reason: 'Moniepoint does not support canceling payments',
      alternative: 'Use the cancelPayment method instead',
    });
  };

  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    throw new ProviderNotSupportedError('createRefund', 'Moniepoint', {
      reason: 'Moniepoint does not support creating refunds',
      alternative: 'Use the createRefund method instead',
    });
  };

  handleWebhook = async (
    payload: HandleWebhookParams,
  ): Promise<Array<WebhookEventPayload>> => {
    throw new ProviderNotSupportedError('handleWebhook', 'Moniepoint', {
      reason: 'Moniepoint does not support handling webhooks',
      alternative: 'Use the handleWebhook method instead',
    });
  };
}
