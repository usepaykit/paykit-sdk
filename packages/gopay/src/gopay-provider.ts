import {
  createPaymentSchema,
  Customer,
  HTTPClient,
  PayKitProvider,
  Subscription,
  UpdateCustomerParams,
  UpdateSubscriptionSchema,
  WebhookEventPayload,
  HandleWebhookParams,
  CreatePaymentSchema,
  CreateRefundSchema,
  CreateSubscriptionSchema,
  Payment,
  Refund,
  UpdatePaymentSchema,
  PaykitProviderOptions,
  CreateCheckoutParams,
  OperationFailedError,
  createCheckoutSchema,
  ValidationError,
  validateRequiredKeys,
  InvalidTypeError,
  Checkout,
  UpdateCheckoutSchema,
  ProviderNotSupportedError,
  createSubscriptionSchema,
  ConfigurationError,
  CapturePaymentSchema,
  createRefundSchema,
  WebhookError,
  tryCatchAsync,
  paykitEvent$InboundSchema,
  Invoice,
} from '@paykit-sdk/core';
import { CreateCustomerParams } from '@paykit-sdk/core';
import crypto from 'crypto';
import { AuthController } from './controllers/auth';
import { GoPayPaymentRequest, GoPayPaymentResponse } from './schema';
import { paykitInvoice$InboundSchema, paykitPayment$InboundSchema, paykitSubscription$InboundSchema } from './utils/mapper';

export const PAYKIT_METADATA_KEY = '__paykit';

export interface GoPayOptions extends PaykitProviderOptions {
  /**
   * The client ID for the GoPay API
   */
  clientId: string;

  /**
   * The client secret for the GoPay API
   */
  clientSecret: string;

  /**
   * The GoID for the GoPay API
   */
  goId: string;

  /**
   * Whether to use the sandbox environment
   */
  isSandbox: boolean;

  /**
   * The webhook URL for the GoPay API
   */
  webhookUrl: string;
}

export class GoPayProvider implements PayKitProvider {
  readonly providerName = 'gopay';

  private _client: HTTPClient;
  private baseUrl: string;
  private authController: AuthController;

  constructor(private readonly opts: GoPayOptions) {
    this.baseUrl = opts.isSandbox ? 'https://gate.gopay.cz/api' : 'https://gw.sandbox.gopay.com/api';
    this._client = new HTTPClient({ baseUrl: this.baseUrl, headers: {} });
    this.authController = new AuthController({ ...opts, baseUrl: this.baseUrl });
  }

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { error, data } = createCheckoutSchema.safeParse(params);

    if (error) throw ValidationError.fromZodError(error, 'gopay', 'createCheckout');

    if (typeof data.customer == 'string' || (typeof data.customer === 'object' && !data.customer.email)) {
      throw new InvalidTypeError('customer', 'object (customer) with email', 'string', {
        provider: this.providerName,
        method: 'createCheckout',
      });
    }

    const {
      amount,
      currency = 'CZK',
      successUrl,
    } = validateRequiredKeys(
      ['amount', 'currency', 'successUrl'],
      data.provider_metadata as Record<string, string>,
      'The following fields must be present in the provider_metadata of createCheckout: {keys}',
    );

    if (this.opts.debug) {
      console.info('Specify `lang` in the provider_metadata of createCheckout to set the language of the checkout, default is `EN`');
      console.info('Creating checkout with metadata:', data.metadata);
    }

    const goPayRequest: GoPayPaymentRequest = {
      payer: {
        allowed_payment_instruments: ['PAYMENT_CARD', 'BANK_ACCOUNT'],
        default_payment_instrument: 'PAYMENT_CARD',
        contact: { email: data.customer.email! },
        ...(data.shipping_info && {
          city: data.shipping_info.address.city,
          postal_code: data.shipping_info.address.postal_code,
          country_code: data.shipping_info.address.country,
          phone_number: data.shipping_info.address.phone,
        }),
      },
      target: { type: 'ACCOUNT', goid: parseInt(this.opts.goId) },
      amount: Number(amount),
      currency,
      order_number: crypto.randomBytes(8).toString('hex').slice(0, 15),
      order_description: data.metadata?.description || 'Checkout',
      items: [{ name: data.item_id, amount: Number(amount), count: data.quantity, type: 'ITEM' }],
      lang: data.provider_metadata?.lang ? (data.provider_metadata.lang as string) : 'EN',
      callback: { return_url: successUrl, notification_url: this.opts.webhookUrl },
      additional_params: Object.entries({
        ...data.metadata,
        [PAYKIT_METADATA_KEY]: JSON.stringify({ itemId: data.item_id, qty: data.quantity }),
      }).map(([name, value]) => ({
        name,
        value: String(value),
      })),
    };

    const response = await this._client.post<GoPayPaymentResponse>('/payments/payment', {
      body: JSON.stringify(goPayRequest),
      headers: await this.authController.getAuthHeaders(),
    });

    console.dir({ response }, { depth: null });

    return response.value as unknown as Checkout;
  };

  retrieveCheckout = async (id: string): Promise<Checkout | null> => {
    const response = await this._client.get<GoPayPaymentResponse>(`/payments/payment/${id}`, {
      headers: await this.authController.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new OperationFailedError('retrieveCheckout', this.providerName, {
        cause: new Error('Failed to retrieve checkout'),
      });
    }

    console.dir({ response }, { depth: null });

    return response.value as unknown as Checkout;
  };

  updateCheckout = async (id: string, params: UpdateCheckoutSchema): Promise<Checkout> => {
    if (this.opts.debug) {
      console.info("Gopay doesn't support updating checkouts");
    }

    const existing = await this.retrieveCheckout(id);

    return existing as Checkout;
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteCheckout', 'gopay', {
      reason: "Gopay doesn't support deleting checkouts",
      alternative: 'Use createCheckout() instead to create a new checkout',
    });
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    throw new ProviderNotSupportedError('createCustomer', 'gopay', {
      reason: "Gopay doesn't support creating customers",
    });
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    throw new ProviderNotSupportedError('updateCustomer', 'gopay', {
      reason: "Gopay doesn't support updating customers",
    });
  };

  deleteCustomer = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deleteCustomer', 'gopay', {
      reason: "Gopay doesn't support deleting customers",
    });
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    throw new ProviderNotSupportedError('retrieveCustomer', 'gopay', {
      reason: "Gopay doesn't support retrieving customers",
    });
  };

  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    const { error, data } = createSubscriptionSchema.safeParse(params);

    if (error) throw ValidationError.fromZodError(error, 'gopay', 'createSubscription');

    if (typeof data.customer == 'string' || (typeof data.customer === 'object' && !data.customer.email)) {
      throw new InvalidTypeError('customer', 'object (customer) with email', 'string', {
        provider: this.providerName,
        method: 'createCheckout',
      });
    }

    const { successUrl, quantity } = validateRequiredKeys(
      ['successUrl', 'quantity'],
      data.provider_metadata as Record<string, string>,
      'The following fields must be present in the provider_metadata of createCheckout: {keys}',
    );

    const intervalMap: Record<Subscription['billing_interval'], 'DAY' | 'WEEK' | 'MONTH' | 'ON_DEMAND'> = {
      day: 'DAY',
      week: 'WEEK',
      month: 'MONTH',
      year: 'MONTH',
    } as const;

    const recurrenceCycle = intervalMap[data.billing_interval] ?? 'ON_DEMAND';

    const goPaySubscriptionOptions: GoPayPaymentRequest = {
      payer: {
        allowed_payment_instruments: ['PAYMENT_CARD'],
        default_payment_instrument: 'PAYMENT_CARD',
        contact: { email: data.customer.email as string },
      },
      target: { type: 'ACCOUNT', goid: parseInt(this.opts.goId) },
      amount: Number(data.amount),
      currency: data.currency ?? 'CZK',
      order_number: crypto.randomBytes(8).toString('hex').slice(0, 15),
      order_description: data.metadata?.description || 'Subscription',
      items: [{ name: data.item_id, amount: Number(data.amount), count: parseInt(quantity) }],
      recurrence: {
        recurrence_cycle: recurrenceCycle,
        recurrence_period: parseInt(quantity),
        recurrence_date_to: new Date(data.current_period_end).toISOString(),
      },
      callback: { return_url: successUrl, notification_url: this.opts.webhookUrl },
    };

    const response = await this._client.post<GoPayPaymentResponse>('/payments/payment', {
      body: JSON.stringify(goPaySubscriptionOptions),
      headers: await this.authController.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new OperationFailedError('createSubscription', this.providerName, {
        cause: new Error('Failed to create subscription'),
      });
    }

    console.dir({ response }, { depth: 100 });

    return response.value as unknown as Subscription;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    console.info("Gopay doesn't support updating subscriptions");

    const subscription = await this.retrieveSubscription(id);

    if (!subscription) {
      throw new OperationFailedError('updateSubscription', this.providerName, {
        cause: new Error('Failed to retrieve subscription'),
      });
    }

    return subscription;
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    const response = await this._client.post<{ id: number; result: string }>(`/payments/payment/${id}/void-recurrence`, {
      headers: await this.authController.getAuthHeaders(),
    });

    console.dir({ response }, { depth: 100 });

    const subscription = await this.retrieveSubscription(id);

    if (!subscription) {
      throw new OperationFailedError('cancelSubscription', this.providerName, {
        cause: new Error('Failed to retrieve subscription'),
      });
    }

    return { ...subscription, status: 'canceled' };
  };

  deleteSubscription = async (id: string): Promise<null> => {
    await this.cancelSubscription(id);
    return null;
  };

  retrieveSubscription = async (id: string): Promise<Subscription | null> => {
    const response = await this._client.get<GoPayPaymentResponse>(`/payments/payment/${id}`, {
      headers: await this.authController.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new OperationFailedError('retrieveSubscription', this.providerName, {
        cause: new Error('Failed to retrieve subscription'),
      });
    }

    console.dir({ response }, { depth: 100 });

    return response.value as unknown as Subscription;
  };

  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const { error, data } = createPaymentSchema.safeParse(params);

    if (error) throw ValidationError.fromZodError(error, this.providerName, 'createPayment');

    if (typeof data.customer == 'string' || (typeof data.customer === 'object' && !data.customer.email)) {
      throw new InvalidTypeError('customer', 'object (customer) with email', 'string', {
        provider: this.providerName,
        method: 'createPayment',
      });
    }

    if (!data.product_id) {
      throw new ConfigurationError('product_id is required, this is the name of the product in GoPay', {
        provider: this.providerName,
        missingKeys: ['product_id'],
      });
    }

    const { quantity } = validateRequiredKeys(
      ['quantity'],
      data.provider_metadata as Record<string, string>,
      'The following fields must be present in the provider_metadata of createPayment: {keys}',
    );

    const goPayRequest: GoPayPaymentRequest = {
      payer: {
        allowed_payment_instruments: ['PAYMENT_CARD', 'BANK_ACCOUNT'],
        default_payment_instrument: 'PAYMENT_CARD',
        contact: { email: data.customer.email as string },
      },
      target: { type: 'ACCOUNT', goid: parseInt(this.opts.goId) },
      amount: data.amount,
      currency: data.currency ?? 'CZK',
      order_number: crypto.randomBytes(8).toString('hex').slice(0, 15),
      order_description: data.metadata?.description || 'Payment',
      items: [{ name: data.product_id, amount: data.amount, count: parseInt(quantity) }],
      preauthorization: false, // automatically captures the payment
      additional_params: Object.entries({
        ...data.metadata,
        [PAYKIT_METADATA_KEY]: JSON.stringify({ itemId: data.product_id, qty: parseInt(quantity) }),
      }).map(([name, value]) => ({
        name,
        value: String(value),
      })),
    };

    const response = await this._client.post<GoPayPaymentResponse>('/payments/payment', {
      body: JSON.stringify(goPayRequest),
      headers: await this.authController.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new OperationFailedError('createPayment', this.providerName, {
        cause: new Error('Failed to create payment'),
      });
    }

    console.dir({ response }, { depth: 100 });

    return response.value as unknown as Payment;
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    const response = await this._client.get<GoPayPaymentResponse>(`/payments/payment/${id}`, {
      headers: await this.authController.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new OperationFailedError('retrievePayment', this.providerName, {
        cause: new Error('Failed to retrieve payment'),
      });
    }

    console.dir({ response }, { depth: 100 });

    return response.value as unknown as Payment;
  };

  deletePayment = async (id: string): Promise<null> => {
    throw new ProviderNotSupportedError('deletePayment', this.providerName, {
      reason: 'GoPay does not support deleting payments, use the',
      alternative: 'Use createRefund() instead to refund payments',
    });
  };

  capturePayment = async (id: string, params: CapturePaymentSchema): Promise<Payment> => {
    const payment = await this._client.get<GoPayPaymentResponse>(`/payments/payment/${id}`, {
      headers: await this.authController.getAuthHeaders(),
    });

    if (!payment.ok) {
      throw new OperationFailedError('capturePayment', this.providerName, {
        cause: new Error('Failed to retrieve payment'),
      });
    }

    const productId = JSON.parse(payment.value.additional_params?.find(param => param.name === PAYKIT_METADATA_KEY)?.value ?? '{}').itemId;
    const quantity = JSON.parse(payment.value.additional_params?.find(param => param.name === PAYKIT_METADATA_KEY)?.value ?? '{}').qty;

    if (!payment) {
      throw new OperationFailedError('capturePayment', this.providerName, {
        cause: new Error('Payment not found after capture'),
      });
    }

    const captureBody = {
      amount: params.amount,
      items: [{ name: productId, amount: params.amount, count: quantity }],
    };

    await this._client.post<GoPayPaymentResponse>(`/payments/payment/${id}/capture`, {
      body: JSON.stringify(captureBody),
      headers: await this.authController.getAuthHeaders(),
    });

    return paykitPayment$InboundSchema(payment.value);
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    const response = await this._client.post<GoPayPaymentResponse>(`/payments/payment/${id}/void-authorization`, {
      headers: await this.authController.getAuthHeaders(),
    });

    console.dir({ response }, { depth: 100 });

    const payment = await this.retrievePayment(id);

    if (!payment) {
      throw new OperationFailedError('cancelPayment', this.providerName, {
        cause: new Error('Payment not found after cancellation'),
      });
    }

    return payment;
  };

  /**
   * Update payment - not supported by GoPay
   */
  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    console.info("Gopay doesn't support updating payments");

    const existing = await this.retrievePayment(id);

    if (!existing) {
      throw new OperationFailedError('updatePayment', this.providerName, {
        cause: new Error('Failed to retrieve payment'),
      });
    }

    return existing;
  };

  async createRefund(params: CreateRefundSchema): Promise<Refund> {
    const { error, data } = createRefundSchema.safeParse(params);

    if (error) throw ValidationError.fromZodError(error, this.providerName, 'createRefund');

    const payment = await this.retrievePayment(data.payment_id);

    if (!payment) {
      throw new OperationFailedError('createRefund', this.providerName, {
        cause: new Error('Failed to retrieve payment'),
      });
    }

    const response = await this._client.post<{ id: number; result: string }>(`/payments/payment/${data.payment_id}/refund`, {
      body: new URLSearchParams({ amount: String(data.amount) }).toString(),
      headers: { ...(await this.authController.getAuthHeaders()), 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      throw new OperationFailedError('createRefund', this.providerName, {
        cause: new Error('Failed to create refund'),
      });
    }

    return {
      id: crypto.randomBytes(8).toString('hex').slice(0, 15),
      amount: data.amount,
      currency: payment.currency,
      reason: data.reason,
      metadata: data.metadata,
    };
  }

  handleWebhook = async (payload: HandleWebhookParams): Promise<Array<WebhookEventPayload>> => {
    const { fullUrl } = payload;

    const paymentId = new URL(fullUrl).searchParams.get('id');
    const parentId = new URL(fullUrl).searchParams.get('parent_id'); // For recurring payments i.e subscriptions

    if (!paymentId) {
      throw new WebhookError('Payment ID is required', { provider: this.providerName });
    }

    if (this.opts.debug) {
      console.info('Received GoPay webhook for payment:', paymentId);
    }

    const [payment, error] = await tryCatchAsync(
      this._client.get<GoPayPaymentResponse>(`/payments/payment/${paymentId}`, {
        headers: await this.authController.getAuthHeaders(),
      }),
    );

    if (error) {
      throw new WebhookError('Failed to retrieve payment', { provider: this.providerName });
    }

    if (!payment.value) {
      throw new WebhookError('Payment not found', { provider: this.providerName });
    }

    if (this.opts.debug) {
      console.info('Webhook verified successfully, status:', payment.value.state);
    }

    const statusMap: Record<string, Payment['status']> = {
      CREATED: 'pending',
      PAYMENT_METHOD_CHOSEN: 'processing',
      PAID: 'succeeded',
      AUTHORIZED: 'requires_capture',
      CANCELED: 'canceled',
      TIMEOUTED: 'failed',
      REFUNDED: 'succeeded', // Payment was successful (refund is separate action)
      PARTIALLY_REFUNDED: 'succeeded', // Payment was successful (partial refund is separate)
    };

    const status = statusMap[payment.value.state];

    const webhookHandlers: Record<Payment['status'], (data: GoPayPaymentResponse) => Array<WebhookEventPayload>> = {
      pending: data => {
        const payment = paykitPayment$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.created',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: payment,
          }),
        ];
      },
      processing: data => {
        const payment = paykitPayment$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.updated',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: payment,
          }),
        ];
      },
      requires_capture: data => {
        const payment = paykitPayment$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.updated',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: payment,
          }),
        ];
      },
      canceled: data => {
        const payment = paykitPayment$InboundSchema(data);

        const isCancellingSubscription = parentId && data.recurrence?.recurrence_state == 'STOPPED';
        const subscription = paykitSubscription$InboundSchema(data);

        const subscriptionCanceledWebhookEvent = {
          type: 'subscription.canceled' as const,
          created: new Date().getTime(),
          id: crypto.randomBytes(8).toString('hex').slice(0, 15),
          data: subscription,
        };

        return [
          ...(isCancellingSubscription ? [paykitEvent$InboundSchema<Subscription>(subscriptionCanceledWebhookEvent)] : []),
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.canceled',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: payment,
          }),
        ];
      },
      failed: data => {
        const payment = paykitPayment$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.canceled',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: payment,
          }),
        ];
      },
      succeeded: data => {
        const payment = paykitPayment$InboundSchema(data);
        const invoice = paykitInvoice$InboundSchema(data, !!parentId);
        const subscription = paykitSubscription$InboundSchema(data);

        const subscriptionCreatedWebhookEvent = {
          type: 'subscription.created' as const,
          created: new Date().getTime(),
          id: crypto.randomBytes(8).toString('hex').slice(0, 15),
          data: subscription,
        };

        return [
          ...(parentId ? [paykitEvent$InboundSchema<Subscription>(subscriptionCreatedWebhookEvent)] : []),
          paykitEvent$InboundSchema<Invoice>({
            type: 'invoice.generated',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: invoice,
          }),
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.created',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: payment,
          }),
        ];
      },
      requires_action: data => {
        const payment = paykitPayment$InboundSchema(data);

        return [
          paykitEvent$InboundSchema<Payment>({
            type: 'payment.updated',
            created: new Date().getTime(),
            id: crypto.randomBytes(8).toString('hex').slice(0, 15),
            data: payment,
          }),
        ];
      },
    };

    const handler = webhookHandlers[status];

    if (!handler) {
      throw new WebhookError(`Invalid webhook status: ${status}, expected one of ${Object.keys(webhookHandlers).join(', ')}`, {
        provider: this.providerName,
      });
    }

    const results = handler(payment.value);

    return results;
  };
}
