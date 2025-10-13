import {
  Checkout,
  CreateCheckoutSchema,
  CreateCustomerParams,
  CreateSubscriptionSchema,
  Customer,
  PayKitProvider,
  ProviderNotSupportedError,
  UpdateCheckoutSchema,
  UpdateCustomerParams,
} from '@paykit-sdk/core';
import axios, { AxiosRequestConfig } from 'axios';
import crypto from 'crypto';

/**
 * Amazon Pay Provider for PayKit
 * Based on Amazon Pay API SDK v2.3.4
 */

const SDK_VERSION = '2.3.4';
const API_VERSION = 'v2';
const RETRIES = 3;

const API_ENDPOINTS = {
  na: 'pay-api.amazon.com',
  eu: 'pay-api.amazon.eu',
  jp: 'pay-api.amazon.jp',
};

const REGION_MAP: Record<string, string> = {
  na: 'na',
  us: 'na',
  de: 'eu',
  uk: 'eu',
  eu: 'eu',
  jp: 'jp',
};

const AMAZON_SIGNATURE_ALGORITHM = {
  DEFAULT: { name: 'AMZN-PAY-RSASSA-PSS', saltLength: 20 },
  V2: { name: 'AMZN-PAY-RSASSA-PSS-V2', saltLength: 32 },
};

// Amazon Pay API Types
interface AmazonPayConfig {
  publicKeyId: string;
  privateKey: string;
  region: 'us' | 'na' | 'eu' | 'uk' | 'de' | 'jp';
  sandbox?: boolean;
  storeId: string;
  algorithm?: 'AMZN-PAY-RSASSA-PSS' | 'AMZN-PAY-RSASSA-PSS-V2';
}

interface AmazonPayPrice {
  amount: string;
  currencyCode: string;
}

interface AmazonPayAddress {
  name?: string;
  addressLine1?: string;
  city?: string;
  stateOrRegion?: string;
  postalCode?: string;
  countryCode?: string;
}

interface AmazonPayBuyer {
  buyerId: string;
  name: string;
  email: string;
}

interface AmazonPayStatusDetails {
  state: string;
  reasonCode?: string;
  lastUpdatedTimestamp: string;
}

interface CheckoutSessionResponse {
  checkoutSessionId: string;
  webCheckoutDetails: {
    amazonPayRedirectUrl?: string;
    checkoutResultReturnUrl?: string;
    checkoutReviewReturnUrl?: string;
  };
  chargePermissionId?: string;
  chargeId?: string;
  buyer?: AmazonPayBuyer;
  statusDetails: AmazonPayStatusDetails;
  creationTimestamp: string;
  expirationTimestamp?: string;
}

interface ChargeResponse {
  chargeId: string;
  chargePermissionId: string;
  chargeAmount: AmazonPayPrice;
  statusDetails: AmazonPayStatusDetails;
  creationTimestamp: string;
}

interface RefundResponse {
  refundId: string;
  chargeId: string;
  refundAmount: AmazonPayPrice;
  statusDetails: AmazonPayStatusDetails;
  creationTimestamp: string;
}

interface ChargePermissionResponse {
  chargePermissionId: string;
  statusDetails: AmazonPayStatusDetails;
  buyer?: AmazonPayBuyer;
  creationTimestamp: string;
}

interface ApiOptions {
  method: string;
  urlFragment: string;
  payload?: any;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
}

export class AmazonPayProvider implements PayKitProvider {
  readonly providerName = 'amazon-pay';
  private config: AmazonPayConfig;
  private algorithm: { name: string; saltLength: number };
  private certCache: Map<string, string> = new Map();

  constructor(config: AmazonPayConfig) {
    this.config = { ...config, sandbox: config.sandbox ?? true };
    this.algorithm = this.getAlgorithm(config.algorithm || 'AMZN-PAY-RSASSA-PSS-V2');
  }

  // ========== CORE SDK FUNCTIONS (from helper.js) ==========

  private getTimestamp(): string {
    return new Date().toISOString().split('.')[0] + 'Z';
  }

  private getAPIEndpointBaseURL(): string {
    const region = REGION_MAP[this.config.region.toLowerCase()];
    return API_ENDPOINTS[region as keyof typeof API_ENDPOINTS];
  }

  private getAlgorithm(algorithm: string) {
    for (const value of Object.values(AMAZON_SIGNATURE_ALGORITHM)) {
      if (value.name === algorithm) return value;
    }
    return AMAZON_SIGNATURE_ALGORITHM.V2;
  }

  private isEnvSpecificPublicKeyId(publicKeyId: string): boolean {
    return publicKeyId.toUpperCase().startsWith('LIVE') || publicKeyId.toUpperCase().startsWith('SANDBOX');
  }

  private getParametersAsString(params?: Record<string, any>): string {
    if (!params) return '';
    return Object.keys(params)
      .sort()
      .map(p => `${p}=${encodeURIComponent(params[p])}`)
      .join('&');
  }

  private signHeaders(options: ApiOptions): Record<string, string> {
    const headers: Record<string, string> = {
      ...options.headers,
      'x-amz-pay-region': REGION_MAP[this.config.region.toLowerCase()],
      'x-amz-pay-host': this.getAPIEndpointBaseURL(),
      'x-amz-pay-date': this.getTimestamp(),
      'content-type': 'application/json',
      accept: 'application/json',
      'user-agent': `amazon-pay-api-sdk-nodejs/${SDK_VERSION} (JS/${process.versions.node}; ${process.platform})`,
    };

    const sortedKeys = Object.keys(headers).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const signedHeaders = sortedKeys.join(';');

    let payload = options.payload;
    if (typeof payload !== 'string') {
      payload = payload ? JSON.stringify(payload) : '';
    }

    let canonicalRequest = `${options.method}\n/${options.urlFragment}\n${this.getParametersAsString(options.queryParams)}\n`;
    sortedKeys.forEach(k => (canonicalRequest += `${k.toLowerCase()}:${headers[k]}\n`));
    canonicalRequest += `\n${signedHeaders}\n${crypto.createHash('SHA256').update(payload).digest('hex')}`;

    const stringToSign = `${this.algorithm.name}\n${crypto.createHash('SHA256').update(canonicalRequest).digest('hex')}`;
    const signature = this.sign(stringToSign);

    headers['authorization'] =
      `${this.algorithm.name} PublicKeyId=${this.config.publicKeyId}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    return headers;
  }

  private sign(stringToSign: string): string {
    const sign = crypto.createSign('RSA-SHA256').update(stringToSign);
    return sign.sign(
      {
        key: this.config.privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: this.algorithm.saltLength,
      },
      'base64',
    );
  }

  private prepareOptions(options: ApiOptions): ApiOptions {
    if (typeof options.payload !== 'string' && options.payload) {
      options.payload = JSON.stringify(options.payload);
    }

    if (this.isEnvSpecificPublicKeyId(this.config.publicKeyId)) {
      options.urlFragment = `${API_VERSION}/${options.urlFragment}`;
    } else {
      const env = this.config.sandbox ? 'sandbox' : 'live';
      options.urlFragment = `${env}/${API_VERSION}/${options.urlFragment}`;
    }
    return options;
  }

  private async sendRequest(options: AxiosRequestConfig, count: number): Promise<any> {
    const delayTime = count === 1 ? 0 : 2 ** (count - 1) * 1000;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        axios.request(options).then(resolve).catch(reject);
      }, delayTime);
    });
  }

  private async retryLogic(options: AxiosRequestConfig, count: number = 1): Promise<any> {
    try {
      return await this.sendRequest(options, count);
    } catch (err: any) {
      const status = err.response?.status;
      if (count <= RETRIES && (status === 408 || status === 425 || status === 429 || status >= 500)) {
        return this.retryLogic(options, count + 1);
      }
      throw err;
    }
  }

  private async invokeApi(apiOptions: ApiOptions): Promise<any> {
    const opts = this.prepareOptions(apiOptions);
    const headers = this.signHeaders(opts);
    const url = `https://${this.getAPIEndpointBaseURL()}/${opts.urlFragment}${apiOptions.queryParams ? '?' + this.getParametersAsString(apiOptions.queryParams) : ''}`;

    return this.retryLogic({
      method: apiOptions.method as any,
      headers,
      url,
      data: opts.payload,
      validateStatus: s => s >= 200 && s < 300,
    });
  }

  // ========== WEBHOOK VERIFICATION ==========

  private async verifyWebhookSignature(payload: string, headers: Record<string, string>): Promise<boolean> {
    try {
      const message = JSON.parse(payload);
      if (!message.Type || !message.Signature || !message.SigningCertURL) return false;

      if (!this.isValidCertUrl(message.SigningCertURL)) return false;

      const cert = await this.getCertificate(message.SigningCertURL);
      const stringToSign = this.buildSnsStringToSign(message);

      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(stringToSign);
      return verify.verify(cert, message.Signature, 'base64');
    } catch {
      return false;
    }
  }

  private isValidCertUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname.endsWith('.amazonaws.com');
    } catch {
      return false;
    }
  }

  private async getCertificate(url: string): Promise<string> {
    if (this.certCache.has(url)) return this.certCache.get(url)!;
    const response = await axios.get(url);
    this.certCache.set(url, response.data);
    return response.data;
  }

  private buildSnsStringToSign(message: any): string {
    const fields =
      message.Type === 'SubscriptionConfirmation'
        ? ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type']
        : ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'];

    let str = '';
    fields.forEach(f => {
      if (message[f]) str += `${f}\n${message[f]}\n`;
    });
    return str;
  }

  // ========== PAYKIT INTERFACE IMPLEMENTATION ==========

  async createCheckout(params: CreateCheckoutSchema): Promise<Checkout> {
    const response = await this.invokeApi({
      method: 'POST',
      urlFragment: 'checkoutSessions',
      payload: {
        storeId: this.config.storeId,
        webCheckoutDetails: {
          checkoutReviewReturnUrl: params.successUrl,
          checkoutResultReturnUrl: params.successUrl,
          checkoutCancelUrl: params.cancelUrl,
        },
        chargePermissionType: params.mode === 'subscription' ? 'Recurring' : 'OneTime',
        ...(params.mode === 'subscription' && {
          recurringMetadata: {
            frequency: { unit: 'Month', value: '1' },
            amount: {
              amount: params.lineItems?.[0]?.amount?.toString() || '0',
              currencyCode: params.currency || 'USD',
            },
          },
        }),
        paymentDetails: {
          paymentIntent: params.captureMethod === 'manual' ? 'Authorize' : 'AuthorizeWithCapture',
          canHandlePendingAuthorization: false,
          chargeAmount: {
            amount: this.calculateTotal(params.lineItems || []).toString(),
            currencyCode: params.currency || 'USD',
          },
        },
        merchantMetadata: {
          merchantReferenceId: params.metadata?.orderId,
          customInformation: JSON.stringify(params.metadata),
        },
      },
    });

    return this.mapCheckout(response.data);
  }

  async retrieveCheckout(id: string): Promise<Checkout | null> {
    try {
      const r = await this.invokeApi({ method: 'GET', urlFragment: `checkoutSessions/${id}` });
      return this.mapCheckout(r.data);
    } catch (e: any) {
      return e.response?.status === 404 ? null : Promise.reject(e);
    }
  }

  async updateCheckout(id: string, params: UpdateCheckoutSchema): Promise<Checkout> {
    const r = await this.invokeApi({
      method: 'PATCH',
      urlFragment: `checkoutSessions/${id}`,
      payload: {
        ...(params.successUrl && { webCheckoutDetails: { checkoutResultReturnUrl: params.successUrl } }),
        ...(params.metadata && { merchantMetadata: { customInformation: JSON.stringify(params.metadata) } }),
      },
    });
    return this.mapCheckout(r.data);
  }

  async deleteCheckout(id: string): Promise<null> {
    const session = await this.retrieveCheckout(id);
    if (session?.id) await this.cancelPayment(session.id);
    return null;
  }

  async createCustomer(params: CreateCustomerParams): Promise<Customer> {
    throw new ProviderNotSupportedError('createCustomer', this.providerName, {
      reason: 'Amazon Pay does not support creating customers',
    });
  }

  async updateCustomer(id: string, params: UpdateCustomerParams): Promise<Customer> {
    return { id, email: params.email, name: params.name, metadata: params.metadata, created: Date.now() };
  }

  async retrieveCustomer(id: string): Promise<Customer | null> {
    return null;
  }

  async deleteCustomer(id: string): Promise<null> {
    return null;
  }

  async createSubscription(params: CreateSubscriptionSchema): Promise<Subscription> {
    const checkout = await this.createCheckout({ ...params, mode: 'subscription' });
    return {
      id: checkout.id,
      customerId: params.customerId,
      status: 'incomplete',
      items: params.items,
      currency: params.currency || 'USD',
      metadata: params.metadata,
      created: Date.now(),
    };
  }

  async updateSubscription(id: string, params: UpdateSubscriptionSchema): Promise<Subscription> {
    const r = await this.invokeApi({
      method: 'PATCH',
      urlFragment: `chargePermissions/${id}`,
      payload: { merchantMetadata: { customInformation: JSON.stringify(params.metadata) } },
    });
    return this.mapSubscription(r.data);
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    const r = await this.invokeApi({
      method: 'DELETE',
      urlFragment: `chargePermissions/${id}`,
      payload: { closureReason: 'Canceled', cancelPendingCharges: false },
    });
    return this.mapSubscription(r.data);
  }

  async deleteSubscription(id: string): Promise<null> {
    await this.invokeApi({
      method: 'DELETE',
      urlFragment: `chargePermissions/${id}`,
      payload: { closureReason: 'Deleted', cancelPendingCharges: true },
    });
    return null;
  }

  async retrieveSubscription(id: string): Promise<Subscription | null> {
    try {
      const r = await this.invokeApi({ method: 'GET', urlFragment: `chargePermissions/${id}` });
      return this.mapSubscription(r.data);
    } catch (e: any) {
      return e.response?.status === 404 ? null : Promise.reject(e);
    }
  }

  async createPayment(params: CreatePaymentSchema): Promise<Payment> {
    const r = await this.invokeApi({
      method: 'POST',
      urlFragment: 'charges',
      payload: {
        chargePermissionId: params.paymentMethodId || params.customerId,
        chargeAmount: { amount: params.amount.toString(), currencyCode: params.currency },
        captureNow: params.captureMethod !== 'manual',
        canHandlePendingAuthorization: false,
        softDescriptor: params.description?.substring(0, 16),
      },
    });
    return this.mapPayment(r.data);
  }

  async updatePayment(id: string, params: UpdatePaymentSchema): Promise<Payment> {
    return this.retrievePayment(id) as Promise<Payment>;
  }

  async retrievePayment(id: string): Promise<Payment | null> {
    try {
      const r = await this.invokeApi({ method: 'GET', urlFragment: `charges/${id}` });
      return this.mapPayment(r.data);
    } catch (e: any) {
      return e.response?.status === 404 ? null : Promise.reject(e);
    }
  }

  async deletePayment(id: string): Promise<null> {
    await this.cancelPayment(id);
    return null;
  }

  async capturePayment(id: string, params: CapturePaymentSchema): Promise<Payment> {
    const r = await this.invokeApi({
      method: 'POST',
      urlFragment: `charges/${id}/capture`,
      payload: {
        captureAmount: { amount: params.amount?.toString(), currencyCode: params.currency || 'USD' },
        softDescriptor: params.metadata?.descriptor?.substring(0, 16),
      },
    });
    return this.mapPayment(r.data);
  }

  async cancelPayment(id: string): Promise<Payment> {
    const r = await this.invokeApi({
      method: 'DELETE',
      urlFragment: `charges/${id}`,
      payload: { cancellationReason: 'Canceled by merchant' },
    });
    return this.mapPayment(r.data);
  }

  async createRefund(params: CreateRefundSchema): Promise<Refund> {
    const r = await this.invokeApi({
      method: 'POST',
      urlFragment: 'refunds',
      payload: {
        chargeId: params.paymentId,
        refundAmount: { amount: params.amount.toString(), currencyCode: params.currency || 'USD' },
        softDescriptor: params.reason?.substring(0, 16),
      },
    });
    return {
      id: r.data.refundId,
      paymentId: r.data.chargeId,
      amount: parseFloat(r.data.refundAmount.amount),
      currency: r.data.refundAmount.currencyCode,
      status: this.mapRefundStatus(r.data.statusDetails.state),
      reason: params.reason,
      metadata: params.metadata,
      created: new Date(r.data.creationTimestamp).getTime(),
    };
  }

  async handleWebhook(payload: HandleWebhookParams): Promise<Array<WebhookEventPayload>> {
    if (!(await this.verifyWebhookSignature(payload.body, payload.headers))) {
      throw new Error('Invalid webhook signature');
    }

    const notification = JSON.parse(payload.body);
    const message = JSON.parse(notification.Message);

    const eventMap: Record<string, string> = {
      CHARGE_COMPLETED: 'payment.succeeded',
      CHARGE_DECLINED: 'payment.failed',
      REFUND_COMPLETED: 'refund.succeeded',
      REFUND_DECLINED: 'refund.failed',
      CHARGE_PERMISSION_UPDATED: 'subscription.updated',
      CHARGE_PERMISSION_CLOSED: 'subscription.canceled',
    };

    return [
      {
        id: message.NotificationId || crypto.randomUUID(),
        type: eventMap[message.ObjectType] || 'unknown',
        data: message,
        created: Date.now(),
      },
    ];
  }

  // ========== MAPPERS ==========

  private mapCheckout(s: CheckoutSessionResponse): Checkout {
    return {
      id: s.checkoutSessionId,
      url: s.webCheckoutDetails.amazonPayRedirectUrl || '',
      status: { Open: 'open', Completed: 'complete', Canceled: 'expired' }[s.statusDetails.state] || 'open',
      customerId: s.buyer?.buyerId,
      paymentId: s.chargeId,
      subscriptionId: s.chargePermissionId,
      successUrl: s.webCheckoutDetails.checkoutResultReturnUrl,
      cancelUrl: s.webCheckoutDetails.checkoutReviewReturnUrl,
      metadata: {},
      expiresAt: s.expirationTimestamp ? new Date(s.expirationTimestamp).getTime() : undefined,
      created: new Date(s.creationTimestamp).getTime(),
    };
  }

  private mapPayment(c: ChargeResponse): Payment {
    return {
      id: c.chargeId,
      amount: parseFloat(c.chargeAmount.amount),
      currency: c.chargeAmount.currencyCode,
      status: ({ Pending: 'pending', Authorized: 'authorized', Captured: 'succeeded', Declined: 'failed', Canceled: 'canceled' }[
        c.statusDetails.state
      ] || 'pending') as any,
      customerId: c.chargePermissionId,
      metadata: {},
      created: new Date(c.creationTimestamp).getTime(),
    };
  }

  private mapSubscription(p: ChargePermissionResponse): Subscription {
    return {
      id: p.chargePermissionId,
      customerId: p.buyer?.buyerId || '',
      status: ({ Chargeable: 'active', NonChargeable: 'paused', Closed: 'canceled' }[p.statusDetails.state] || 'incomplete') as any,
      items: [],
      currency: 'USD',
      metadata: {},
      created: new Date(p.creationTimestamp).getTime(),
    };
  }

  private mapRefundStatus(s: string): RefundStatus {
    return ({ Pending: 'pending', Completed: 'succeeded', Declined: 'failed' }[s] || 'pending') as any;
  }

  private calculateTotal(items: Array<{ amount: number }>): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }
}
