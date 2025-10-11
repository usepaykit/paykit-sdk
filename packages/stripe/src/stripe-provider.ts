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
  UpdateCheckoutSchema,
  CreateSubscriptionSchema,
  CreatePaymentSchema,
  Payment,
  UpdatePaymentSchema,
  CreateRefundSchema,
  Refund,
  createSubscriptionSchema,
  createPaymentSchema,
  updatePaymentSchema,
  NotImplementedError,
  ValidationError,
  InvalidTypeError,
  updateSubscriptionSchema,
  retrieveSubscriptionSchema,
  retrievePaymentSchema,
  deletePaymentSchema,
  createRefundSchema,
  CapturePaymentSchema,
  capturePaymentSchema,
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

export interface StripeOptions extends PaykitProviderOptions<Stripe.StripeConfig> {
  apiKey: string;
}

export class StripeProvider implements PayKitProvider {
  private stripe: Stripe;

  constructor(config: StripeOptions) {
    const { debug, apiKey, ...rest } = config;

    this.stripe = new Stripe(apiKey, rest);
  }

  readonly providerName = 'stripe';

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const metadata = _.mapValues(params.metadata ?? {}, value => JSON.stringify(value));

    const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
      ...(typeof params.customer === 'string' && { customer: params.customer }),
      ...(typeof params.customer === 'object' && { customer: params.customer.email }),
      mode: params.session_type === 'one_time' ? 'payment' : 'subscription',
      line_items: [{ price: params.item_id, quantity: params.quantity }],
      ...(params.session_type == 'one_time' && { metadata }),
      ...(params.session_type == 'recurring' && { subscription_data: { metadata } }),
      ...params.provider_metadata,
    };

    if (params.shipping_info) {
      // todo: get stripe list of allowed countries and validate against that
      checkoutOptions.shipping_address_collection = {
        allowed_countries: [params.shipping_info.address.country as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry],
      };

      checkoutOptions.shipping_options = [
        {
          shipping_rate: params.shipping_info.carrier,
          shipping_rate_data: {
            display_name: params.shipping_info.carrier ?? '',
            fixed_amount: { amount: 0, currency: params.shipping_info.currency },
          },
        },
      ];
    }

    const checkout = await this.stripe.checkout.sessions.create(checkoutOptions);

    return paykitCheckout$InboundSchema(checkout);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.retrieve(id);

    return paykitCheckout$InboundSchema(checkout);
  };

  updateCheckout = async (id: string, params: UpdateCheckoutSchema): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.update(id, params);

    return paykitCheckout$InboundSchema(checkout);
  };

  deleteCheckout = async (id: string): Promise<null> => {
    throw new NotImplementedError('deleteCheckout', 'stripe', { futureSupport: false });
  };

  /**
   * Customer management
   */
  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const customer = await this.stripe.customers.create(params);

    return paykitCustomer$InboundSchema(customer);
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const { provider_metadata, ...rest } = params;

    const customer = await this.stripe.customers.update(id, { ...rest, ...provider_metadata });

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
    const { error, data } = createSubscriptionSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'createSubscription');
    }

    if (typeof data.customer === 'object') {
      throw new InvalidTypeError('customer', 'string (customer ID)', 'object', {
        provider: this.providerName,
        method: 'createSubscription',
      });
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: data.customer,
      items: [{ price: data.item_id }],
      metadata: _.mapValues(data.metadata ?? {}, value => JSON.stringify(value)),
      ...data.provider_metadata,
    });

    return paykitSubscription$InboundSchema(subscription);
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.cancel(id);

    return paykitSubscription$InboundSchema(subscription);
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    const { error, data } = updateSubscriptionSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'updateSubscription');
    }

    const subscription = await this.stripe.subscriptions.update(id, { metadata: _.mapValues(data.metadata ?? {}, value => JSON.stringify(value)) });

    return paykitSubscription$InboundSchema(subscription);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const { error, data } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'retrieveSubscription');
    }

    const subscription = await this.stripe.subscriptions.retrieve(data.id);

    return paykitSubscription$InboundSchema(subscription);
  };

  deleteSubscription = async (id: string): Promise<null> => {
    const { error, data } = retrieveSubscriptionSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'deleteSubscription');
    }

    await this.stripe.subscriptions.cancel(data.id);

    return null;
  };

  /**
   * Payment management
   */
  createPayment = async (params: CreatePaymentSchema): Promise<Payment> => {
    const { error, data } = createPaymentSchema.safeParse(params);

    if (error) throw new Error(error.message.split('\n').join(' '));

    const { provider_metadata, customer, ...rest } = data;

    if (typeof customer === 'object') {
      throw new InvalidTypeError('customer', 'string (customer ID)', 'object', {
        provider: this.providerName,
        method: 'createPayment',
      });
    }

    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      ...provider_metadata,
      ...rest,
      metadata: _.mapValues({ ...(rest.metadata ?? {}), ...(provider_metadata?.metadata ?? {}), product_id: params.product_id ?? null }, value =>
        JSON.stringify(value),
      ),
      customer,
    };

    if (data.shipping_info) {
      paymentIntentOptions.shipping = {
        name: data.shipping_info.address.name,
        phone: data.shipping_info.address.phone,
        address: {
          line1: data.shipping_info.address.line1,
          line2: data.shipping_info.address.line2,
          city: data.shipping_info.address.city,
          state: data.shipping_info.address.state,
          postal_code: data.shipping_info.address.postal_code,
          country: data.shipping_info.address.country,
        },
      };
    }

    const payment = await this.stripe.paymentIntents.create(paymentIntentOptions);

    return paykitPayment$InboundSchema(payment);
  };

  updatePayment = async (id: string, params: UpdatePaymentSchema): Promise<Payment> => {
    const { error, data } = updatePaymentSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'updatePayment');
    }

    const { provider_metadata, customer, ...rest } = data;

    if (typeof customer === 'object') {
      throw new InvalidTypeError('customer', 'string (customer ID)', 'object', {
        provider: this.providerName,
        method: 'updatePayment',
      });
    }

    const payment = await this.stripe.paymentIntents.update(id, { ...rest, ...provider_metadata, customer });

    return paykitPayment$InboundSchema(payment);
  };

  retrievePayment = async (id: string): Promise<Payment | null> => {
    const { error, data } = retrievePaymentSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'retrievePayment');
    }

    const payment = await this.stripe.paymentIntents.retrieve(data.id);

    return paykitPayment$InboundSchema(payment);
  };

  deletePayment = async (id: string): Promise<null> => {
    const { error, data } = deletePaymentSchema.safeParse({ id });

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'deletePayment');
    }

    await this.stripe.paymentIntents.cancel(data.id);

    return null;
  };

  capturePayment = async (id: string, params: CapturePaymentSchema): Promise<Payment> => {
    const { error, data } = capturePaymentSchema.safeParse(params);

    if (error) throw new ValidationError(error.message, { provider: this.providerName, method: 'capturePayment' });

    const payment = await this.stripe.paymentIntents.capture(id, { amount_to_capture: data.amount });

    return paykitPayment$InboundSchema(payment);
  };

  cancelPayment = async (id: string): Promise<Payment> => {
    const payment = await this.stripe.paymentIntents.cancel(id);

    return paykitPayment$InboundSchema(payment);
  };

  /**
   * Refund management
   */
  createRefund = async (params: CreateRefundSchema): Promise<Refund> => {
    const { error, data } = createRefundSchema.safeParse(params);

    if (error) {
      throw ValidationError.fromZodError(error, this.providerName, 'createRefund');
    }

    const { provider_metadata, ...rest } = params;

    const refund = await this.stripe.refunds.create({ ...rest, reason: rest.reason as any, ...provider_metadata });

    return paykitRefund$InboundSchema(refund);
  };

  /**
   * Webhook management
   */
  handleWebhook = async (params: HandleWebhookParams): Promise<Array<WebhookEventPayload>> => {
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

    const webhookHandlers: Partial<Record<StripeEventLiteral, (event: Stripe.Event) => Promise<Array<WebhookEventPayload> | null>>> = {
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
          customer: typeof data.customer === 'string' ? data.customer : (data.customer?.id ?? ''),
          billing_mode: billingModeSchema.parse('one_time'),
          subscription_id: null,
          custom_fields: data.custom_fields ?? null,
          line_items: data.line_items?.data.map(item => ({ id: item.price!.id, quantity: item.quantity! })) ?? [],
        };

        const invoice = { type: 'invoice.generated' as const, created: event.created, id: event.id, data: invoiceData };

        // Handle consumeble purchase
        return [paykitEvent$InboundSchema<Invoice>(invoice)];
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
        return [paykitEvent$InboundSchema<Invoice>(invoice)];
      },

      /**
       * Customer
       */
      'customer.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Customer;

        const customer = { type: 'customer.created' as const, created: event.created, id: event.id, data: paykitCustomer$InboundSchema(data) };

        return [paykitEvent$InboundSchema<Customer>(customer)];
      },

      'customer.updated': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Customer;

        const customer = { type: 'customer.updated' as const, created: event.created, id: event.id, data: paykitCustomer$InboundSchema(data) };

        return [paykitEvent$InboundSchema<Customer>(customer)];
      },

      'customer.deleted': async (event: Stripe.Event) => {
        const customer = { type: 'customer.deleted' as const, created: event.created, id: event.id, data: null };

        return [paykitEvent$InboundSchema<null>(customer)];
      },

      /**
       * Subscription
       */
      'customer.subscription.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Subscription;

        const subscription = paykitSubscription$InboundSchema(data);

        return [paykitEvent$InboundSchema<Subscription>({ type: 'subscription.created', created: event.created, id: event.id, data: subscription })];
      },

      'customer.subscription.updated': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Subscription;

        const subscription = paykitSubscription$InboundSchema(data);

        return [paykitEvent$InboundSchema<Subscription>({ type: 'subscription.updated', created: event.created, id: event.id, data: subscription })];
      },

      'customer.subscription.deleted': async (event: Stripe.Event) => {
        const subscription = null;

        return [paykitEvent$InboundSchema<null>({ type: 'subscription.canceled', created: event.created, id: event.id, data: subscription })];
      },

      'payment_intent.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.PaymentIntent;

        const payment = paykitPayment$InboundSchema(data);

        return [paykitEvent$InboundSchema<Payment>({ type: 'payment.created', created: event.created, id: event.id, data: payment })];
      },

      ...stripePaymentIntentUpdateEventsWithHandlers.map(() => async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.PaymentIntent;

        const payment = paykitPayment$InboundSchema(data);

        return [paykitEvent$InboundSchema<Payment>({ type: 'payment.updated', created: event.created, id: event.id, data: payment })];
      }),

      'payment_intent.canceled': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.PaymentIntent;

        const payment = paykitPayment$InboundSchema(data);

        return [paykitEvent$InboundSchema<Payment>({ type: 'payment.canceled', created: event.created, id: event.id, data: payment })];
      },

      'refund.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Refund;

        const refund = paykitRefund$InboundSchema(data);

        return [paykitEvent$InboundSchema<Refund>({ type: 'refund.created', created: event.created, id: event.id, data: refund })];
      },
    };

    const handler = webhookHandlers[event.type];

    if (!handler) throw new Error(`Unhandled event type: ${event.type}`);

    const result = await handler(event);

    if (!result) throw new Error(`Unhandled event type: ${event.type}`);

    return result;
  };
}
