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
  WebhookError,
  parseJSON,
  WebhookEventType,
  OAuth2TokenManager,
} from '@paykit-sdk/core';
import { sha512 } from 'js-sha512';
import { z } from 'zod';
import { monnifyToPaykitEventMap } from './utils/mapper';

export interface MonnifyOptions extends PaykitProviderOptions {
  /**
   * The API key for the Monnify API
   */
  apiKey: string;

  /**
   * The secret key for the Monnify API
   */
  secretKey: string;

  /**
   * Whether to use the sandbox environment
   */
  isSandbox: boolean;
}

const monnifyOptionsSchema = schema<MonnifyOptions>()(
  z.object({
    apiKey: z.string(),
    secretKey: z.string(),
    isSandbox: z.boolean(),
  }),
);

const providerName = 'monnify';

export class MonnifyProvider extends AbstractPayKitProvider implements PayKitProvider {
  readonly providerName = providerName;

  private _client: HTTPClient;
  private baseUrl: string;

  private tokenManager: OAuth2TokenManager;

  constructor(private readonly opts: MonnifyOptions) {
    super(monnifyOptionsSchema, opts, providerName);

    const debug = opts.debug ?? true;

    this.baseUrl = opts.isSandbox
      ? 'https://sandbox.monnify.com/api/v1'
      : 'https://api.monnify.com/api';

    this._client = new HTTPClient({
      baseUrl: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      retryOptions: { max: 3, baseDelay: 1000, debug },
    });

    this.tokenManager = new OAuth2TokenManager({
      client: this._client,
      provider: this.providerName,
      tokenEndpoint: '/auth/login',
      credentials: { username: opts.apiKey, password: opts.secretKey },
      responseAdapter: response => ({
        accessToken: response.responseBody?.accessToken ?? '',
        expiresIn: response.responseBody?.expiresIn ?? 0,
      }),
      expiryBuffer: 5 * 60, // 5 minutes
    });
  }

  createCheckout = async (params: CreateCheckoutSchema): Promise<Checkout> => {
    const response = await this._client.post<{
      requestSuccessful: boolean;
      responseCode: number;
      responseBody: {
        paymentReference: string;
      };
    }>('/payments/initiate', {
      body: JSON.stringify(params),
      headers: await this.tokenManager.getAuthHeaders(),
    });

    return response.value?.responseBody.paymentReference as any as Checkout;
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
    const { body, headers, webhookSecret } = payload;

    const receivedHash = headers.get('monnify-signature');

    if (!receivedHash) {
      throw new WebhookError('Missing Moniepoint signature', {
        provider: this.providerName,
      });
    }

    const computedHash = sha512.hmac(webhookSecret, JSON.stringify(body));

    if (computedHash !== receivedHash)
      throw new WebhookError('Invalid Moniepoint signature', {
        provider: this.providerName,
      });

    const { eventType, eventData } = parseJSON(
      body,
      z
        .object({
          eventType: z.string(),
          eventData: z.record(z.any()),
        })
        .strict(),
    );

    const eventMapper = monnifyToPaykitEventMap[eventType];

    if (!eventMapper) {
      throw new WebhookError('Unknown Monnify event type', {
        provider: this.providerName,
      });
    }

    if (typeof eventMapper === 'function') {
      const event = eventMapper(eventData);

      return [
        {
          type: event,
          created: new Date().getTime(),
          id: `paykit:webhook:${Math.random().toString(36).substring(2, 15)}`,
          data: eventData as any, // todo: add mapper for event data
        },
      ];
    } else {
      const event = eventMapper as WebhookEventType;

      return [
        {
          type: event,
          created: new Date().getTime(),
          id: `paykit:webhook:${Math.random().toString(36).substring(2, 15)}`,
          data: eventData as any, // todo: add mapper for event data
        },
      ];
    }
  };
}
