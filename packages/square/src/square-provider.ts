import {
  AbstractPayKitProvider,
  PayKitProvider,
  Checkout,
  CreateCheckoutSchema,
  UpdateCheckoutSchema,
  Customer,
  CreateCustomerParams,
  UpdateCustomerParams,
  Payment,
  CreatePaymentSchema,
  UpdatePaymentSchema,
  CapturePaymentSchema,
  PaymentStatus,
  Refund,
  CreateRefundSchema,
  Subscription,
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
  WebhookEventPayload,
  HandleWebhookParams,
  PaykitProviderOptions,
  schema,
  validateRequiredKeys,
  InvalidTypeError,
} from '@paykit-sdk/core';
import * as crypto from 'crypto';
import { Square, SquareClient, SquareEnvironment } from 'square';
import { z } from 'zod';

export interface SquareOptions extends PaykitProviderOptions {
  /**
   * The access toke for square API
   */
  accessToken: string;

  /**
   * Square location ID
   */
  locationId: string;

  /**
   * Whether to use the sandbox environment
   */
  isSandbox: boolean;
}

const squareOptionsSchema = schema<SquareOptions>()(
  z.object({
    accessToken: z.string(),
    locationId: z.string(),
    isSandbox: z.boolean(),
    debug: z.boolean().optional(),
  }),
);

/**
 * Square Provider for PayKit
 *
 * Integrates Square's Payment, Checkout, Subscriptions, and Customer APIs
 * into the unified PayKit interface.
 */

const providerName = 'square';

export class SquareProvider extends AbstractPayKitProvider implements PayKitProvider {
  readonly providerName = 'square';

  private client: SquareClient;
  private locationId: string;
  private debug: boolean;

  constructor(opts: SquareOptions) {
    super(squareOptionsSchema, opts, 'Square');

    const { accessToken, isSandbox, debug = true, locationId } = opts;

    this.client = new SquareClient({
      token: accessToken,
      version: '2025-09-24',
      environment: isSandbox ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
    });

    this.locationId = locationId;
    this.debug = debug;
  }

  createCheckout = async (params: CreateCheckoutSchema): Promise<Checkout> => {
    try {
      const idempotencyKey = crypto.randomBytes(16).toString('hex');

      const { amount, currency } = validateRequiredKeys(
        ['amount', 'currency'],
        process.env as Record<string, string>,
        'Missing required parameters from `provider_metadata`: {keys} ',
      );

      let customerEmail: string | undefined;

      if (typeof params.customer == 'string') {
        customerEmail = (await this.retrieveCustomer(params.customer))?.email;
      } else {
        customerEmail = params.customer.email;
      }

      if (!customerEmail) {
        throw new InvalidTypeError('customer', 'object', 'string (customer ID)', {
          provider: this.providerName,
          method: 'createSubscription',
        });
      }

      // For recurring payments, create subscription checkout
      if (params.session_type === 'recurring' && params.subscription) {
        return await this.createSubscriptionCheckout(params, idempotencyKey, customerEmail);
      }

      // For one-time payments, create payment link (Quick Pay)
      const response = await this.client.checkout.paymentLinks.create({
        idempotencyKey,
        quickPay: {
          name: `Order ${params.item_id}`,
          locationId: this.locationId,
          priceMoney: {
            amount: BigInt(amount),
            currency: currency as Square.Currency,
          },
        },
        prePopulatedData: {
          buyerEmail: customerEmail,
          buyerPhoneNumber: params.billing?.address.phone,
          buyerAddress: params.billing
            ? {
                addressLine1: params.billing.address?.line1,
                addressLine2: params.billing.address?.line2,
                locality: params.billing.address?.city,
                administrativeDistrictLevel1: params.billing.address?.state,
                postalCode: params.billing.address?.postal_code,
                country: (params.billing.address?.country as Square.Country) || 'US',
              }
            : undefined,
        },
        checkoutOptions: {
          askForShippingAddress: !!params.billing,
        },
      });

      const paymentLink = response.paymentLink;
      if (!paymentLink) {
        throw new Error('Failed to create Square payment link');
      }

      return {
        id: paymentLink.id!,
        customer: { email: customerEmail },
        payment_url: paymentLink.url!,
        metadata: params.metadata,
        session_type: 'one_time',
        products: [{ id: params.item_id, quantity: params.quantity }],
        currency: (params.provider_metadata?.currency as string) || 'USD',
        amount: (params.provider_metadata?.amount as number) || 0,
        subscription: params.subscription,
      };
    } catch (error: any) {
      throw new Error(`Square checkout creation failed: ${error.message}`);
    }
  };

  private async createSubscriptionCheckout(
    params: CreateCheckoutSchema,
    idempotencyKey: string,
    customerEmail: string,
  ): Promise<Checkout> {
    if (params.session_type !== 'recurring' || !params.subscription) {
      throw new Error('Subscription data required for recurring checkout');
    }

    // For subscription checkout, the subscription_plan_id should be in item_id
    const response = await this.client.checkout.paymentLinks.create({
      idempotencyKey,
      order: { id: params.item_id, locationId: this.locationId, customerId: params.customer.toString() },
      prePopulatedData: {
        buyerEmail: customerEmail,
        buyerPhoneNumber: params.billing?.address.phone,
      },
    });

    const paymentLink = response.paymentLink;
    if (!paymentLink) {
      throw new Error('Failed to create Square subscription checkout');
    }

    return {
      id: paymentLink.id!,
      customer: { email: customerEmail },
      payment_url: paymentLink.url!,
      metadata: params.metadata,
      session_type: 'recurring',
      products: [{ id: params.item_id, quantity: params.quantity }],
      currency: (params.provider_metadata?.currency as string) || 'USD',
      amount: (params.provider_metadata?.amount as number) || 0,
      subscription: params.subscription,
    };
  }

  async retrieveCheckout(id: string): Promise<Checkout | null> {
    try {
      const response = await this.client.checkout.paymentLinks.get({ id });
      const paymentLink = response.paymentLink;

      if (!paymentLink) return null;

      return {
        id: paymentLink.id!,
        customer: { email: '' }, // Email not returned in retrieve
        payment_url: paymentLink.url!,
        metadata: null,
        session_type: paymentLink.subscriptionPlanVariationId ? 'recurring' : 'one_time',
        products: [],
        currency: 'USD',
        amount: 0,
        subscription: paymentLink.subscriptionPlanVariationId
          ? {
              billing_interval: 'month',
              billing_interval_count: 1,
            }
          : null,
      };
    } catch (error) {
      return null;
    }
  }

  async updateCheckout(id: string, params: UpdateCheckoutSchema): Promise<Checkout> {
    try {
      const existing = await this.retrieveCheckout(id);
      if (!existing) {
        throw new Error(`Checkout ${id} not found`);
      }

      const response = await this.client.checkoutApi.updatePaymentLink(id, {
        paymentLink: {
          version: 1, // You should track versions properly
          checkoutOptions: params.billing
            ? {
                askForShippingAddress: true,
              }
            : undefined,
        },
      });

      const updated = response.result.paymentLink;
      if (!updated) {
        throw new Error('Failed to update checkout');
      }

      return {
        ...existing,
        metadata: params.metadata ?? existing.metadata,
      };
    } catch (error: any) {
      throw new Error(`Square checkout update failed: ${error.message}`);
    }
  }

  async deleteCheckout(id: string): Promise<null> {
    try {
      await this.client.checkoutApi.deletePaymentLink(id);
      return null;
    } catch (error: any) {
      throw new Error(`Square checkout deletion failed: ${error.message}`);
    }
  }

  /**
   * CUSTOMER OPERATIONS
   */

  async createCustomer(params: CreateCustomerParams): Promise<Customer> {
    try {
      const response = await this.client.customers.create({
        idempotencyKey: crypto.randomBytes(16).toString('hex'),
        emailAddress: params.email,
        givenName: params.name,
        phoneNumber: params.phone,
        note: JSON.stringify(params.metadata ?? {}),
      });

      const customer = response.customer;

      if (!customer) {
        throw new Error('Failed to create customer');
      }

      return {
        id: customer.id!,
        email: customer.emailAddress || params.email,
        name: customer.givenName || params.name || '',
        phone: customer.phoneNumber || params.phone,
        metadata: params.metadata,
      };
    } catch (error: any) {
      throw new Error(`Square customer creation failed: ${error.message}`);
    }
  }

  async updateCustomer(id: string, params: UpdateCustomerParams): Promise<Customer> {
    const customer = await this.retrieveCustomer(id);

    if (!customer) {
      throw new Error('Invalid customer');
    }

    const metadata = customer?.metadata;

    try {
      const response = await this.client.customers.update({
        customerId: id,
        emailAddress: params.email,
        givenName: params.name,
        phoneNumber: params.phone,
        note: JSON.stringify({ ...customer.metadata, ...(params.metadata && { ...params.metadata }) }),
      });

      return {
        id: customer.id!,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        metadata: params.metadata,
      };
    } catch (error: any) {
      throw new Error(`Square customer update failed: ${error.message}`);
    }
  }

  async retrieveCustomer(id: string): Promise<Customer | null> {
    try {
      const response = await this.client.customers.get({ customerId: id });
      const customer = response.customer;

      if (!customer) return null;

      return {
        id: customer.id!,
        email: customer.emailAddress || '',
        name: customer.givenName || '',
        phone: customer.phoneNumber || '',
        metadata: customer.note ? JSON.parse(customer.note) : undefined,
      };
    } catch (error) {
      return null;
    }
  }

  async deleteCustomer(id: string): Promise<null> {
    try {
      await this.client.customers.delete({ customerId: id });
      return null;
    } catch (error: any) {
      throw new Error(`Square customer deletion failed: ${error.message}`);
    }
  }

  /**
   * SUBSCRIPTION OPERATIONS
   */

  async createSubscription(params: CreateSubscriptionSchema): Promise<Subscription> {
    try {
      const customerId =
        typeof params.customer === 'string'
          ? params.customer
          : (
              await this.createCustomer({
                email: params.customer.email,
                phone: '',
                name: '',
              })
            ).id;

      const response = await this.client.subscriptions.create({
        idempotencyKey: crypto.randomBytes(16).toString('hex'),
        locationId: this.locationId,
        planVariationId: params.item_id,
        customerId,
        startDate: new Date(params.current_period_start).toISOString(),
        priceOverrideMoney: params.amount
          ? { amount: BigInt(params.amount), currency: (params.currency as Square.Currency) || 'USD' }
          : undefined,
      });

      const subscription = response.subscription;

      if (!subscription) {
        throw new Error('Failed to create subscription');
      }

      return this.mapSquareSubscription(subscription);
    } catch (error: any) {
      throw new Error(`Square subscription creation failed: ${error.message}`);
    }
  }

  async updateSubscription(id: string, params: UpdateSubscriptionSchema): Promise<Subscription> {
    try {
      const response = await this.client.subscriptionsApi.updateSubscription(id, {
        subscription: {
          cardId: params.payment_method_id,
          priceOverrideMoney: params.amount
            ? {
                amount: BigInt(params.amount),
                currency: params.currency || 'USD',
              }
            : undefined,
        },
      });

      const subscription = response.result.subscription;
      if (!subscription) {
        throw new Error('Failed to update subscription');
      }

      return this.mapSquareSubscription(subscription);
    } catch (error: any) {
      throw new Error(`Square subscription update failed: ${error.message}`);
    }
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    try {
      const response = await this.client.subscriptions.cancel({ subscriptionId: id });

      const subscription = response.subscription;

      if (!subscription) {
        throw new Error('Failed to cancel subscription');
      }

      return this.mapSquareSubscription(subscription);
    } catch (error: any) {
      throw new Error(`Square subscription cancellation failed: ${error.message}`);
    }
  }

  async deleteSubscription(id: string): Promise<null> {
    // Square doesn't support permanent deletion, only cancellation
    await this.cancelSubscription(id);
    return null;
  }

  async retrieveSubscription(id: string): Promise<Subscription | null> {
    try {
      const response = await this.client.subscriptions.get({ subscriptionId: id });
      const subscription = response.subscription;

      return subscription ? this.mapSquareSubscription(subscription) : null;
    } catch (error) {
      return null;
    }
  }

  private mapSquareSubscription(sub: any): Subscription {
    return {
      id: sub.id!,
      customer: sub.customerId!,
      status: this.mapSubscriptionStatus(sub.status),
      item_id: sub.planVariationId!,
      amount: sub.priceMoney?.amount ? Number(sub.priceMoney.amount) : 0,
      currency: sub.priceMoney?.currency || 'USD',
      billing_interval: 'month', // Extract from plan if needed
      current_period_start: sub.chargedThroughDate || new Date().toISOString(),
      current_period_end: sub.chargedThroughDate || new Date().toISOString(),
      metadata: null,
      custom_fields: null,
    };
  }

  private mapSubscriptionStatus(status?: string): Subscription['status'] {
    switch (status) {
      case 'ACTIVE':
        return 'active';
      case 'CANCELED':
        return 'canceled';
      case 'PAUSED':
        return 'pending';
      case 'PENDING':
        return 'pending';
      default:
        return 'expired';
    }
  }

  /**
   * PAYMENT OPERATIONS
   */

  async createPayment(params: CreatePaymentSchema): Promise<Payment> {
    try {
      const customerId = typeof params.customer === 'string' ? params.customer : undefined;

      const response = await this.client.payments.create({
        idempotencyKey: crypto.randomBytes(16).toString('hex'),
        sourceId: params.provider_metadata?.source_id as string,
        amountMoney: {
          amount: BigInt(params.amount),
          currency: params.currency as Square.Currency,
        },
        locationId: this.locationId,
        customerId,
        autocomplete:
          !params.provider_metadata?.capture_method || params.provider_metadata.capture_method === 'automatic',
        note: params.metadata ? JSON.stringify(params.metadata) : undefined,
      });

      const payment = response.result.payment;
      if (!payment) {
        throw new Error('Failed to create payment');
      }

      return {
        id: payment.id!,
        amount: Number(payment.amountMoney?.amount || 0),
        currency: payment.amountMoney?.currency || params.currency,
        customer: customerId || { email: '' },
        status: this.mapPaymentStatus(payment.status),
        metadata: params.metadata,
        product_id: params.product_id,
      };
    } catch (error: any) {
      throw new Error(`Square payment creation failed: ${error.message}`);
    }
  }

  async updatePayment(id: string, params: UpdatePaymentSchema): Promise<Payment> {
    // Square doesn't support updating payments after creation
    // Return the current payment state
    const payment = await this.retrievePayment(id);
    if (!payment) {
      throw new Error(`Payment ${id} not found`);
    }
    return payment;
  }

  async retrievePayment(id: string): Promise<Payment | null> {
    try {
      const response = await this.client.paymentsApi.getPayment(id);
      const payment = response.result.payment;

      if (!payment) return null;

      return {
        id: payment.id!,
        amount: Number(payment.amountMoney?.amount || 0),
        currency: payment.amountMoney?.currency || 'USD',
        customer: payment.customerId || { email: '' },
        status: this.mapPaymentStatus(payment.status),
        metadata: null,
        product_id: null,
      };
    } catch (error) {
      return null;
    }
  }

  async deletePayment(id: string): Promise<null> {
    // Cancel payment instead of delete
    await this.cancelPayment(id);
    return null;
  }

  async capturePayment(id: string, params: CapturePaymentSchema): Promise<Payment> {
    try {
      const response = await this.client.paymentsApi.completePayment(id, {
        amountMoney: {
          amount: BigInt(params.amount),
          currency: 'USD', // Should be from payment
        },
      });

      const payment = response.result.payment;
      if (!payment) {
        throw new Error('Failed to capture payment');
      }

      return {
        id: payment.id!,
        amount: Number(payment.amountMoney?.amount || 0),
        currency: payment.amountMoney?.currency || 'USD',
        customer: payment.customerId || { email: '' },
        status: this.mapPaymentStatus(payment.status),
        metadata: null,
        product_id: null,
      };
    } catch (error: any) {
      throw new Error(`Square payment capture failed: ${error.message}`);
    }
  }

  async cancelPayment(id: string): Promise<Payment> {
    try {
      const response = await this.client.paymentsApi.cancelPayment(id);
      const payment = response.result.payment;

      if (!payment) {
        throw new Error('Failed to cancel payment');
      }

      return {
        id: payment.id!,
        amount: Number(payment.amountMoney?.amount || 0),
        currency: payment.amountMoney?.currency || 'USD',
        customer: payment.customerId || { email: '' },
        status: 'canceled',
        metadata: null,
        product_id: null,
      };
    } catch (error: any) {
      throw new Error(`Square payment cancellation failed: ${error.message}`);
    }
  }

  private mapPaymentStatus(status?: string): PaymentStatus {
    switch (status) {
      case 'APPROVED':
        return 'requires_capture';
      case 'COMPLETED':
        return 'succeeded';
      case 'CANCELED':
        return 'canceled';
      case 'FAILED':
        return 'failed';
      case 'PENDING':
        return 'pending';
      default:
        return 'processing';
    }
  }

  /**
   * REFUND OPERATIONS
   */

  async createRefund(params: CreateRefundSchema): Promise<Refund> {
    try {
      const response = await this.client.refundsApi.refundPayment({
        idempotencyKey: crypto.randomBytes(16).toString('hex'),
        paymentId: params.payment_id,
        amountMoney: {
          amount: BigInt(params.amount),
          currency: params.currency || 'USD',
        },
        reason: params.reason,
      });

      const refund = response.result.refund;
      if (!refund) {
        throw new Error('Failed to create refund');
      }

      return {
        id: refund.id!,
        payment_id: refund.paymentId!,
        amount: Number(refund.amountMoney?.amount || 0),
        currency: refund.amountMoney?.currency || 'USD',
        reason: refund.reason || null,
        status: this.mapRefundStatus(refund.status),
        metadata: params.metadata,
      };
    } catch (error: any) {
      throw new Error(`Square refund creation failed: ${error.message}`);
    }
  }

  private mapRefundStatus(status?: string): Refund['status'] {
    switch (status) {
      case 'COMPLETED':
        return 'succeeded';
      case 'PENDING':
        return 'pending';
      case 'FAILED':
      case 'REJECTED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * WEBHOOK OPERATIONS
   */

  async handleWebhook(payload: HandleWebhookParams): Promise<Array<WebhookEventPayload>> {
    try {
      // Verify webhook signature if signature key is configured
      if (this.webhookSignatureKey) {
        const { WebhooksHelper } = await import('square');

        const isValid = WebhooksHelper.verifySignature({
          requestBody: payload.body,
          signatureHeader: payload.signature,
          signatureKey: this.webhookSignatureKey,
          notificationUrl: payload.url || '',
        });

        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
      }

      const event = JSON.parse(payload.body);

      // Map Square webhook events to PayKit events
      return [
        {
          id: event.event_id || crypto.randomBytes(16).toString('hex'),
          type: this.mapSquareEventType(event.type),
          data: event.data,
          created: new Date(event.created_at).getTime(),
        },
      ];
    } catch (error: any) {
      throw new Error(`Square webhook handling failed: ${error.message}`);
    }
  }

  private mapSquareEventType(squareType: string): string {
    // Map Square event types to PayKit event types
    const typeMap: Record<string, string> = {
      'payment.created': 'payment.created',
      'payment.updated': 'payment.updated',
      'refund.created': 'refund.created',
      'refund.updated': 'refund.updated',
      'subscription.created': 'subscription.created',
      'subscription.updated': 'subscription.updated',
      'customer.created': 'customer.created',
      'customer.updated': 'customer.updated',
    };

    return typeMap[squareType] || squareType;
  }
}
