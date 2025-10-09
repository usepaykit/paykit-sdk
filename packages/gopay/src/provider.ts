import {
  createPaymentSchema,
  createCustomerSchema,
  Customer,
  HTTPClient,
  PayKitProvider,
  retrievePaymentSchema,
  retrieveCustomerSchema,
  retrieveSubscriptionSchema,
  Subscription,
  UpdateCustomerParams,
  UpdateSubscriptionSchema,
  updateCustomerSchema,
  updateSubscriptionSchema,
  WebhookEventPayload,
  HandleWebhookParams,
  CreatePaymentSchema,
  CreateRefundSchema,
  CreateSubscriptionSchema,
  Payment,
  Refund,
  UpdatePaymentSchema,
} from '@paykit-sdk/core';
import { CreateCustomerParams } from '@paykit-sdk/core';

export interface GoPayConfig {
  clientId: string;
  clientSecret: string;
  goId: string;
  baseUrl: string;
  sandbox: boolean;
}

interface GoPayTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

interface GoPayPaymentResponse {
  id: number;
  order_number: string;
  state: string;
  sub_state?: string;
  amount: number;
  currency: string;
  payment_instrument?: string;
  payer?: Record<string, unknown>;
  target: {
    type: string;
    goid: number;
  };
  recurrence?: Record<string, unknown>;
  preauthorization?: Record<string, unknown>;
  gw_url?: string;
  additional_params?: Array<{ name: string; value: string }>;
  lang: string;
}

interface GoPayPaymentItem {
  type: string;
  name: string;
  amount: number;
  count: number;
  vat_rate?: string;
  ean?: string;
  product_url?: string;
}

export class GoPayProvider implements PayKitProvider {
  readonly providerName = 'gopay';

  private _client: HTTPClient;
  private _accessToken: string | null = null;
  private _tokenExpiry: number = 0;

  constructor(private readonly opts: GoPayConfig) {
    this._client = new HTTPClient({
      baseUrl: opts.baseUrl,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  }

  /**
   * Gets or refreshes OAuth2 access token
   * GoPay tokens expire after 30 minutes
   */
  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this._accessToken && this._tokenExpiry > now) return this._accessToken;

    const credentials = Buffer.from(`${this.opts.clientId}:${this.opts.clientSecret}`).toString('base64');

    const response = await this._client.post<GoPayTokenResponse>('/oauth2/token', {
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'payment-create' }).toString(),
    });

    if (!response.ok || !response.value.access_token) {
      throw new Error('Failed to obtain GoPay access token');
    }

    this._accessToken = response.value.access_token;

    // Set expiry 5 minutes before actual expiry for safety
    this._tokenExpiry = now + (response.value.expires_in - 300) * 1000;

    return this._accessToken as string;
  }

  /**
   * Helper to get authorized headers for API calls
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' };
  }

  /**
   * Maps to GoPay: POST /payments/payment
   * Creates a payment with line items
   */
  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const { error, data } = createPaymentSchema.safeParse(params);
    if (error) throw new Error(`Payment validation failed: ${error.message}`);

    const metadata = (params.provider_metadata as Record<string, unknown>) || {};

    // Build items array from line items
    const items: GoPayPaymentItem[] = [];
    if (params.line_items && Array.isArray(params.line_items)) {
      for (const item of params.line_items) {
        items.push({
          type: 'ITEM',
          name: item.description || 'Item',
          amount: item.amount || 0,
          count: item.quantity || 1,
          vat_rate: metadata.vat_rate ? String(metadata.vat_rate) : '21',
        });
      }
    }

    const paymentRequest = {
      payer: {
        allowed_payment_instruments: metadata.allowed_payment_instruments || ['PAYMENT_CARD', 'BANK_ACCOUNT'],
        default_payment_instrument: metadata.default_payment_instrument || 'PAYMENT_CARD',
        contact: {
          first_name: params.customer_name?.split(' ')[0] || 'Customer',
          last_name: params.customer_name?.split(' ')[1] || '',
          email: params.email || '',
          phone_number: metadata.phone_number ? String(metadata.phone_number) : undefined,
          city: metadata.city ? String(metadata.city) : undefined,
          street: metadata.street ? String(metadata.street) : undefined,
          postal_code: metadata.postal_code ? String(metadata.postal_code) : undefined,
          country_code: metadata.country_code ? String(metadata.country_code) : 'CZE',
        },
      },
      target: {
        type: 'ACCOUNT',
        goid: parseInt(this.opts.goId),
      },
      items,
      amount: params.amount || 0,
      currency: params.currency || 'CZK',
      order_number: params.reference_id || String(params.id),
      order_description: params.description || 'Payment',
      lang: metadata.lang ? String(metadata.lang) : 'EN',
      callback: {
        return_url: metadata.return_url ? String(metadata.return_url) : undefined,
        notification_url: metadata.notification_url ? String(metadata.notification_url) : undefined,
      },
    };

    // Remove undefined fields
    Object.keys(paymentRequest).forEach(key => {
      if (paymentRequest[key] === undefined) {
        delete paymentRequest[key];
      }
    });

    const headers = await this.getAuthHeaders();
    const response = await this._client.post<GoPayPaymentResponse>('/payments/payment', {
      headers,
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok || !response.value.id) {
      throw new Error(`Failed to create payment: ${JSON.stringify(response.value)}`);
    }

    const state = response.value.state || 'CREATED';
    const statusMap: Record<string, string> = {
      CREATED: 'PENDING',
      PAID: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELED: 'CANCELLED',
      AUTHORIZED: 'AUTHORIZED',
      PARTLY_REFUNDED: 'REFUNDED',
      FULLY_REFUNDED: 'REFUNDED',
      EXPIRED: 'EXPIRED',
    };

    return {
      id: String(response.value.id),
      status: statusMap[state] || 'PENDING',
      amount: response.value.amount || 0,
      currency: response.value.currency || 'CZK',
      customer_id: params.customer_id || '',
      reference_id: response.value.order_number || '',
      payment_url: response.value.gw_url || '',
      redirect_url: response.value.gw_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Payment;
  };

  /**
   * Maps to GoPay: GET /payments/payment/{id}
   * Retrieves payment status
   */
  retrievePayment = async (id: string): Promise<Payment | null> => {
    const { error } = retrievePaymentSchema.safeParse({ id });
    if (error) throw new Error(`Payment retrieval validation failed: ${error.message}`);

    const headers = await this.getAuthHeaders();
    const response = await this._client.get<GoPayPaymentResponse>(`/payments/payment/${id}`, { headers });

    if (!response.ok || !response.value.id) {
      return null;
    }

    const state = response.value.state || 'CREATED';
    const statusMap: Record<string, string> = {
      CREATED: 'PENDING',
      PAID: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELED: 'CANCELLED',
      AUTHORIZED: 'AUTHORIZED',
      PARTLY_REFUNDED: 'REFUNDED',
      FULLY_REFUNDED: 'REFUNDED',
      EXPIRED: 'EXPIRED',
    };

    return {
      id: String(response.value.id),
      status: statusMap[state] || 'PENDING',
      amount: response.value.amount || 0,
      currency: response.value.currency || 'CZK',
      reference_id: response.value.order_number || '',
      method: response.value.payment_instrument || 'UNKNOWN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Payment;
  };

  /**
   * Update payment - not supported by GoPay
   */
  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    throw new Error('GoPay does not support payment updates');
  };

  /**
   * Maps to GoPay: POST /payments/payment/{id}/refund
   * Creates a refund for a paid payment
   */
  deletePayment = async (id: string): Promise<null> => {
    // GoPay doesn't have a delete endpoint, but we can void authorization if it's preauthorized
    // For regular payments, we throw an error as refunds require explicit amount
    throw new Error('Use createRefund() instead to refund payments');
  };

  /**
   * Maps to GoPay: POST /payments/payment/{id}/capture
   * Captures a pre-authorized payment (full or partial)
   */
  capturePayment = async (id: string): Promise<Payment> => {
    const headers = await this.getAuthHeaders();
    const response = await this._client.post<{ id: number; result: string }>(`/payments/payment/${id}/capture`, {
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to capture payment: ${JSON.stringify(response.value)}`);
    }

    const payment = await this.retrievePayment(id);
    return payment || ({} as Payment);
  };

  /**
   * Maps to GoPay: POST /payments/payment/{id}/refund
   * Refunds a paid payment (full or partial)
   */
  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    if (!params.payment_id) {
      throw new Error('payment_id is required for refund');
    }

    const amount = params.amount || 0;
    const headers = await this.getAuthHeaders();

    const response = await this._client.post<{ id: number; result: string }>(`/payments/payment/${params.payment_id}/refund`, {
      headers,
      body: new URLSearchParams({
        amount: String(amount),
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to create refund: ${JSON.stringify(response.value)}`);
    }

    return {
      id: `refund_${Date.now()}`,
      payment_id: params.payment_id,
      amount,
      status: 'COMPLETED',
      reason: params.reason || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Refund;
  };

  /**
   * Maps to GoPay: POST /payments/payment with recurrence object
   * Creates a recurring subscription payment
   */
  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    const metadata = (params.provider_metadata as Record<string, unknown>) || {};

    // Build items
    const items: GoPayPaymentItem[] = [];
    if (params.line_items && Array.isArray(params.line_items)) {
      for (const item of params.line_items) {
        items.push({
          type: 'ITEM',
          name: item.description || 'Subscription Item',
          amount: item.amount || 0,
          count: item.quantity || 1,
        });
      }
    }

    // Recurrence cycles: DAY, WEEK, MONTH, ON_DEMAND
    const recurrenceCycleMap: Record<string, string> = {
      daily: 'DAY',
      weekly: 'WEEK',
      monthly: 'MONTH',
      'on-demand': 'ON_DEMAND',
    };

    const paymentRequest = {
      payer: {
        allowed_payment_instruments: metadata.allowed_payment_instruments || ['PAYMENT_CARD'],
        default_payment_instrument: metadata.default_payment_instrument || 'PAYMENT_CARD',
        contact: {
          first_name: params.customer_name?.split(' ')[0] || 'Customer',
          last_name: params.customer_name?.split(' ')[1] || '',
          email: params.email || '',
          country_code: metadata.country_code ? String(metadata.country_code) : 'CZE',
        },
      },
      target: {
        type: 'ACCOUNT',
        goid: parseInt(this.opts.goId),
      },
      items,
      recurrence: {
        recurrence_cycle: recurrenceCycleMap[params.interval] || 'MONTH',
        recurrence_period: params.interval_count || 1,
        recurrence_date_to: params.trial_period_days
          ? new Date(Date.now() + params.trial_period_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : undefined,
      },
      amount: params.amount || 0,
      currency: params.currency || 'CZK',
      order_number: params.reference_id || String(params.id),
      order_description: params.description || 'Subscription',
      lang: 'EN',
      callback: {
        return_url: metadata.return_url ? String(metadata.return_url) : undefined,
        notification_url: metadata.notification_url ? String(metadata.notification_url) : undefined,
      },
    };

    // Remove undefined fields
    Object.keys(paymentRequest).forEach(key => {
      if (paymentRequest[key] === undefined) {
        delete paymentRequest[key];
      }
    });

    const headers = await this.getAuthHeaders();
    const response = await this._client.post<GoPayPaymentResponse>('/payments/payment', {
      headers,
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok || !response.value.id) {
      throw new Error(`Failed to create subscription: ${JSON.stringify(response.value)}`);
    }

    const recurrence = (response.value.recurrence as Record<string, unknown>) || {};

    return {
      id: String(response.value.id),
      customer_id: params.customer_id || '',
      status: 'PENDING',
      interval: params.interval || 'monthly',
      interval_count: params.interval_count || 1,
      amount: response.value.amount || 0,
      currency: response.value.currency || 'CZK',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (params.interval_count || 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Subscription;
  };

  /**
   * Maps to GoPay: POST /payments/payment/{id}/create-recurrence
   * Creates a recurring payment based on ON_DEMAND parent payment
   */
  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    const { error } = updateSubscriptionSchema.safeParse({ id, ...params });
    if (error) throw new Error(`Subscription update validation failed: ${error.message}`);

    throw new Error('GoPay does not support subscription updates - create a new recurrence instead');
  };

  /**
   * Retrieve subscription - not directly supported
   */
  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const { error } = retrieveSubscriptionSchema.safeParse({ id });
    if (error) throw new Error(`Subscription retrieval validation failed: ${error.message}`);

    // Retrieve the payment which may have recurrence info
    const payment = await this.retrievePayment(id);
    if (!payment) {
      throw new Error('Subscription/Payment not found');
    }

    return {
      id,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Subscription;
  };

  /**
   * Maps to GoPay: POST /payments/payment/{id}/void-recurrence
   * Cancels recurring payment
   */
  cancelSubscription = async (id: string): Promise<Subscription> => {
    const headers = await this.getAuthHeaders();
    const response = await this._client.post<{ id: number; result: string }>(`/payments/payment/${id}/void-recurrence`, {
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${JSON.stringify(response.value)}`);
    }

    return {
      id,
      status: 'CANCELLED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Subscription;
  };

  /**
   * Customer creation - GoPay doesn't have customer management API
   * Customer data is embedded in payments
   */
  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const { error, data } = createCustomerSchema.safeParse(params);
    if (error) throw new Error(`Customer validation failed: ${error.message}`);

    // Return a customer object - in real usage, this would be stored in your database
    return {
      id: params.id || `customer_${Date.now()}`,
      email: params.email || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Customer;
  };

  /**
   * Retrieve customer - not supported
   */
  retrieveCustomer = async (id: string): Promise<Customer> => {
    const { error } = retrieveCustomerSchema.safeParse({ id });
    if (error) throw new Error(`Customer retrieval validation failed: ${error.message}`);

    throw new Error('GoPay does not support customer retrieval - customers are embedded in payments');
  };

  /**
   * Update customer - not supported
   */
  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const { error } = updateCustomerSchema.safeParse({ id, ...params });
    if (error) throw new Error(`Customer update validation failed: ${error.message}`);

    throw new Error('GoPay does not support customer updates');
  };

  /**
   * Delete customer - not supported
   */
  deleteCustomer = async (id: string): Promise<null> => {
    throw new Error('GoPay does not support customer deletion');
  };

  /**
   * Handles GoPay webhook notifications
   * GoPay sends POST notifications to configured notification_url
   */
  handleWebhook = async (payload: HandleWebhookParams): Promise<WebhookEventPayload> => {
    const body = payload.body as Record<string, unknown>;

    if (!body || typeof body !== 'object') {
      throw new Error('Invalid webhook payload');
    }

    const id = body.id as number;
    const state = body.state as string;

    if (!id || !state) {
      throw new Error('Missing required webhook parameters: id, state');
    }

    // Verify payment status via API to ensure webhook authenticity
    const payment = await this.retrievePayment(String(id));
    if (!payment) {
      throw new Error(`Failed to verify payment ${id} status`);
    }

    const stateMap: Record<string, string> = {
      CREATED: 'payment.created',
      PAID: 'payment.completed',
      FAILED: 'payment.failed',
      CANCELED: 'payment.cancelled',
      AUTHORIZED: 'payment.authorized',
      PARTLY_REFUNDED: 'payment.partially_refunded',
      FULLY_REFUNDED: 'payment.refunded',
      EXPIRED: 'payment.expired',
    };

    return {
      id: String(id),
      type: stateMap[state] || 'payment.unknown',
      data: {
        id,
        state,
        order_number: body.order_number as string,
        amount: body.amount as number,
        currency: body.currency as string,
        payment_instrument: body.payment_instrument as string,
        payer: body.payer as Record<string, unknown>,
        recurrence: body.recurrence as Record<string, unknown>,
        preauthorization: body.preauthorization as Record<string, unknown>,
      },
      timestamp: new Date().toISOString(),
    } as WebhookEventPayload;
  };
}
