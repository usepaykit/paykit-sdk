import {
  PayKitProvider,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionSchema,
  paykitEvent$InboundSchema,
  WebhookEventPayload,
  PaykitProviderOptions,
  headersExtractor,
  Invoice,
  HandleWebhookParams,
  invoiceStatusSchema,
  billingModeSchema,
  UpdateCheckoutParams,
  CreateSubscriptionSchema,
  CreatePaymentSchema,
  Payment,
  UpdatePaymentSchema,
  CreateRefundSchema,
  Refund,
} from '@paykit-sdk/core';
import _ from 'lodash';
import Stripe from 'stripe';
import {
  paykitCheckout$InboundSchema,
  paykitCustomer$InboundSchema,
  paykitInvoice$InboundSchema,
  paykitPayment$InboundSchema,
  paykitRefund$InboundSchema,
  paykitSubscription$InboundSchema,
} from '../lib/mapper';

export interface StripeConfig extends PaykitProviderOptions<Stripe.StripeConfig> {
  apiKey: string;
}

export class StripeProvider implements PayKitProvider {
  private stripe: Stripe;

  constructor(config: StripeConfig) {
    const { debug, apiKey, ...rest } = config;

    this.stripe = new Stripe(apiKey, rest);
  }

  readonly providerName = 'stripe';

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.create({
      customer: params.customer_id,
      mode: params.session_type === 'one_time' ? 'payment' : 'subscription',
      ...(params.session_type == 'one_time' && { metadata: _.mapValues(params.metadata ?? {}, value => JSON.stringify(value)) }),
      ...(params.session_type == 'recurring' && {
        subscription_data: { metadata: _.mapValues(params.metadata ?? {}, value => JSON.stringify(value)) },
      }),
      line_items: [{ price: params.item_id, quantity: params.quantity }],
      ...params.provider_metadata,
    });

    return paykitCheckout$InboundSchema(checkout);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.retrieve(id);

    return paykitCheckout$InboundSchema(checkout);
  };

  updateCheckout = async (id: string, params: UpdateCheckoutParams): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.update(id, params);

    return paykitCheckout$InboundSchema(checkout);
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new Error('Not implemented');
  };

  /**
   * Customer management
   */
  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const customer = await this.stripe.customers.create(params);

    return paykitCustomer$InboundSchema(customer);
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const customer = await this.stripe.customers.update(id, params);

    return paykitCustomer$InboundSchema(customer);
  };

  deleteCustomer = async (id: string): Promise<null> => {
    await this.stripe.customers.del(id);

    return null;
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    const customer = await this.stripe.customers.retrieve(id);

    if ('deleted' in customer) return null;

    return paykitCustomer$InboundSchema(customer);
  };

  /**
   * Subscription management
   */
  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.create({
      customer: params.customer_id,
      items: [{ price: params.item_id }],
      metadata: _.mapValues(params.metadata ?? {}, value => JSON.stringify(value)),
      ...params.provider_metadata,
    });

    return paykitSubscription$InboundSchema(subscription);
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.cancel(id);

    return paykitSubscription$InboundSchema(subscription);
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.update(id, { metadata: _.mapValues(params.metadata ?? {}, value => JSON.stringify(value)) });

    return paykitSubscription$InboundSchema(subscription);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.retrieve(id);

    return paykitSubscription$InboundSchema(subscription);
  };

  deleteSubscription = async (id: string): Promise<null> => {
    await this.stripe.subscriptions.cancel(id);

    return null;
  };

  /**
   * Payment management
   */
  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const { provider_metadata, ...rest } = params;

    const payment = await this.stripe.paymentIntents.create({ ...rest, ...provider_metadata });

    return paykitPayment$InboundSchema(payment);
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    const { provider_metadata, ...rest } = params;

    const payment = await this.stripe.paymentIntents.update(id, { ...rest, ...provider_metadata });

    return paykitPayment$InboundSchema(payment);
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    const payment = await this.stripe.paymentIntents.retrieve(id);

    return paykitPayment$InboundSchema(payment);
  };

  deletePayment = async (id: string): Promise<null> => {
    await this.stripe.paymentIntents.cancel(id);

    return null;
  };

  capturePayment = async (id: string): Promise<Payment> => {
    const payment = await this.stripe.paymentIntents.capture(id);

    return paykitPayment$InboundSchema(payment);
  };

  /**
   * Refund management
   */
  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    const { provider_metadata, ...rest } = params;

    const refund = await this.stripe.refunds.create({ ...rest, reason: rest.reason as any, ...provider_metadata });

    return paykitRefund$InboundSchema(refund);
  };

  /**
   * Webhook management
   */
  handleWebhook = async (params: HandleWebhookParams): Promise<WebhookEventPayload> => {
    const { body, headers, webhookSecret } = params;

    const stripeHeaders = headersExtractor(headers, ['x-stripe-signature']);
    const signature = stripeHeaders[0].value;

    const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

    type StripeEventLiteral = typeof event.type;

    const stripePaymentIntentUpdateEventsWithHandlers: Array<StripeEventLiteral> = [
      'payment_intent.processing',
      'payment_intent.requires_action',
      'payment_intent.amount_capturable_updated',
      'payment_intent.partially_funded',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
    ];

    const webhookHandlers: Partial<Record<StripeEventLiteral, (event: Stripe.Event) => Promise<WebhookEventPayload | null>>> = {
      /**
       * Invoice
       */
      'checkout.session.completed': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Checkout.Session;

        if (data.mode !== 'payment') return null;

        const invoiceData = {
          id: data.id,
          status: invoiceStatusSchema.parse('paid'),
          paid_at: new Date(event.created * 1000).toISOString(),
          amount_paid: data.amount_total ?? 0,
          currency: data.currency ?? '',
          metadata: _.mapValues(data.metadata ?? {}, value => JSON.stringify(value)),
          customer_id: data.customer?.toString() ?? '',
          billing_mode: billingModeSchema.parse('one_time'),
          subscription_id: null,
          custom_fields: data.custom_fields ?? null,
          line_items: data.line_items?.data.map(item => ({ id: item.price!.id, quantity: item.quantity! })) ?? [],
        };

        const invoice = { type: 'invoice.generated' as const, created: event.created, id: event.id, data: invoiceData };

        // Handle consumeble purchase
        return paykitEvent$InboundSchema<Invoice>(invoice);
      },

      'invoice.paid': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Invoice;

        const relevantBillingReasons = ['subscription_create', 'subscription_cycle'];

        if (data.status !== 'paid' && !relevantBillingReasons.includes(data.billing_reason!)) return null;

        const invoice = {
          type: 'invoice.generated' as const,
          created: event.created,
          id: event.id,
          data: paykitInvoice$InboundSchema({ ...data, billingMode: 'recurring' }),
        };

        /**
         * Handle subscription creation and cycle
         */
        return paykitEvent$InboundSchema<Invoice>(invoice);
      },

      /**
       * Customer
       */
      'customer.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Customer;

        const customer = { type: 'customer.created' as const, created: event.created, id: event.id, data: paykitCustomer$InboundSchema(data) };

        return paykitEvent$InboundSchema<Customer>(customer);
      },

      'customer.updated': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Customer;

        const customer = { type: 'customer.updated' as const, created: event.created, id: event.id, data: paykitCustomer$InboundSchema(data) };

        return paykitEvent$InboundSchema<Customer>(customer);
      },

      'customer.deleted': async (event: Stripe.Event) => {
        const customer = { type: 'customer.deleted' as const, created: event.created, id: event.id, data: null };

        return paykitEvent$InboundSchema<null>(customer);
      },

      /**
       * Subscription
       */
      'customer.subscription.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Subscription;

        const subscription = {
          type: 'subscription.created' as const,
          created: event.created,
          id: event.id,
          data: paykitSubscription$InboundSchema(data),
        };

        return paykitEvent$InboundSchema<Subscription>(subscription);
      },

      'customer.subscription.updated': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Subscription;

        const subscription = {
          type: 'subscription.updated' as const,
          created: event.created,
          id: event.id,
          data: paykitSubscription$InboundSchema(data),
        };

        return paykitEvent$InboundSchema<Subscription>(subscription);
      },

      'customer.subscription.deleted': async (event: Stripe.Event) => {
        const subscription = { type: 'subscription.canceled' as const, created: event.created, id: event.id, data: null };

        return paykitEvent$InboundSchema<null>(subscription);
      },

      'payment_intent.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.PaymentIntent;

        const payment = { type: 'payment.created' as const, created: event.created, id: event.id, data: paykitPayment$InboundSchema(data) };

        return paykitEvent$InboundSchema<Payment>(payment);
      },

      ...stripePaymentIntentUpdateEventsWithHandlers.map(() => async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.PaymentIntent;

        const payment = { type: 'payment.updated' as const, created: event.created, id: event.id, data: paykitPayment$InboundSchema(data) };

        return paykitEvent$InboundSchema<Payment>(payment);
      }),

      'payment_intent.canceled': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.PaymentIntent;

        const payment = { type: 'payment.canceled' as const, created: event.created, id: event.id, data: paykitPayment$InboundSchema(data) };

        return paykitEvent$InboundSchema<Payment>(payment);
      },
    };

    const handler = webhookHandlers[event.type];

    if (!handler) throw new Error(`Unhandled event type: ${event.type}`);

    const result = await handler(event);

    if (!result) throw new Error(`Unhandled event type: ${event.type}`);

    return result;
  };
}
