import {
  PayKitProvider,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionParams,
  toPaykitEvent,
  WebhookEventPayload,
  PaykitProviderOptions,
  headersExtractor,
  Invoice,
  HandleWebhookParams,
  stringifyObjectValues,
} from '@paykit-sdk/core';
import Stripe from 'stripe';
import {
  paykitCheckout$InboundSchema,
  paykitCustomer$InboundSchema,
  paykitInvoice$InboundSchema,
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

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.create({
      customer: params.customer_id,
      mode: params.session_type === 'one_time' ? 'payment' : 'subscription',
      ...(params.session_type == 'one_time' && { metadata: stringifyObjectValues(params.metadata ?? {}) }),
      ...(params.session_type == 'recurring' && { subscription_data: { metadata: stringifyObjectValues(params.metadata ?? {}) } }),
      line_items: [{ price: params.item_id, quantity: params.quantity }],
      ...params.provider_metadata,
    });

    return paykitCheckout$InboundSchema(checkout);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.retrieve(id);

    return paykitCheckout$InboundSchema(checkout);
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
  cancelSubscription = async (id: string): Promise<null> => {
    await this.stripe.subscriptions.cancel(id);

    return null;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.update(id, { metadata: stringifyObjectValues(params.metadata ?? {}) });

    return paykitSubscription$InboundSchema(subscription);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.retrieve(id);

    return paykitSubscription$InboundSchema(subscription);
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

    const webhookHandlers: Partial<Record<StripeEventLiteral, (event: Stripe.Event) => Promise<WebhookEventPayload | null>>> = {
      /**
       * Invoice
       */
      'checkout.session.completed': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Checkout.Session;

        if (data.mode !== 'payment') return null;

        // Handle consumeble purchase
        return toPaykitEvent<Invoice>({
          type: '$invoicePaid',
          created: event.created,
          id: event.id,
          data: {
            id: data.id,
            status: 'paid',
            paid_at: new Date(event.created * 1000).toISOString(),
            amount_paid: data.amount_total ?? 0,
            currency: data.currency ?? '',
            metadata: stringifyObjectValues({ ...(data.metadata ?? {}) }),
            customer_id: data.customer?.toString() ?? '',
            billing_mode: 'one_time',
            line_items: [], // todo: add line item
            subscription_id: null,
          },
        });
      },

      'invoice.paid': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Invoice;

        if (data.status !== 'paid' && !['subscription_create', 'subscription_cycle'].includes(data.billing_reason as Stripe.Invoice.BillingReason)) {
          return null;
        }

        // Handle subscription purchase
        return toPaykitEvent<Invoice>({
          type: '$invoicePaid',
          created: event.created,
          id: event.id,
          data: paykitInvoice$InboundSchema({ ...data, billingMode: 'recurring' }),
        });
      },

      /**
       * Customer
       */
      'customer.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Customer;

        return toPaykitEvent<Customer>({ type: '$customerCreated', created: event.created, id: event.id, data: paykitCustomer$InboundSchema(data) });
      },

      'customer.updated': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Customer;

        return toPaykitEvent<Customer>({ type: '$customerUpdated', created: event.created, id: event.id, data: paykitCustomer$InboundSchema(data) });
      },

      'customer.deleted': async (event: Stripe.Event) => {
        return toPaykitEvent<null>({ type: '$customerDeleted', created: event.created, id: event.id, data: null });
      },

      /**
       * Subscription
       */
      'customer.subscription.created': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Subscription;

        return toPaykitEvent<Subscription>({
          type: '$subscriptionCreated',
          created: event.created,
          id: event.id,
          data: paykitSubscription$InboundSchema(data),
        });
      },

      'customer.subscription.updated': async (event: Stripe.Event) => {
        const data = event.data.object as Stripe.Subscription;

        return toPaykitEvent<Subscription>({
          type: '$subscriptionUpdated',
          created: event.created,
          id: event.id,
          data: paykitSubscription$InboundSchema(data),
        });
      },

      'customer.subscription.deleted': async (event: Stripe.Event) => {
        return toPaykitEvent<null>({ type: '$subscriptionCancelled', created: event.created, id: event.id, data: null });
      },
    };

    const handler = webhookHandlers[event.type];

    if (!handler) throw new Error(`Unhandled event type: ${event.type}`);

    const result = await handler(event);

    if (!result) throw new Error(`Unhandled event type: ${event.type}`);

    return result;
  };
}
