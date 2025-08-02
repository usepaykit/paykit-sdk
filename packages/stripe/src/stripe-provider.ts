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
  $ExtWebhookHandlerConfig,
  stringifyObjectValues,
} from '@paykit-sdk/core';
import Stripe from 'stripe';
import { toPaykitCheckout, toPaykitCustomer, toPaykitInvoice, toPaykitSubscription } from '../lib/mapper';

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
    const { customer_id, item_id, metadata, session_type, provider_metadata } = params;

    const checkout = await this.stripe.checkout.sessions.create({
      customer: customer_id,
      mode: session_type === 'one_time' ? 'payment' : 'subscription',
      ...(session_type == 'one_time' && { metadata }),
      ...(session_type == 'recurring' && { subscription_data: { metadata } }),
      line_items: [{ price: item_id }],
      ...provider_metadata,
    });

    return toPaykitCheckout(checkout);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const checkout = await this.stripe.checkout.sessions.retrieve(id);

    return toPaykitCheckout(checkout);
  };

  /**
   * Customer management
   */
  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const customer = await this.stripe.customers.create(params);

    return toPaykitCustomer(customer);
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const customer = await this.stripe.customers.update(id, params);

    return toPaykitCustomer(customer);
  };

  deleteCustomer = async (id: string): Promise<null> => {
    await this.stripe.customers.del(id);

    return null;
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    const customer = await this.stripe.customers.retrieve(id);

    if ('deleted' in customer) return null;

    return toPaykitCustomer(customer);
  };

  /**
   * Subscription management
   */
  cancelSubscription = async (id: string): Promise<null> => {
    await this.stripe.subscriptions.cancel(id);

    return null;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.update(id, { metadata: params.metadata });

    return toPaykitSubscription(subscription);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.retrieve(id);

    return toPaykitSubscription(subscription);
  };

  /**
   * Webhook management
   */
  handleWebhook = async (params: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
    const { body, headers, webhookSecret } = params;

    const stripeHeaders = headersExtractor(headers, ['x-stripe-signature']);
    const signature = stripeHeaders[0].value;

    const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const data = event.data.object;

      return toPaykitEvent<Invoice>({
        type: '$invoicePaid',
        created: event.created,
        id: event.id,
        data: {
          id: data.id,
          amount: data.amount_total ?? 0,
          currency: data.currency ?? '',
          metadata: stringifyObjectValues(data.metadata ?? {}),
          customer_id: data.customer?.toString() ?? '',
        },
      });
    } else if (event.type === 'customer.created') {
      const customer = event.data.object;

      return toPaykitEvent<Customer>({
        type: '$customerCreated',
        created: event.created,
        id: event.id,
        data: toPaykitCustomer(customer),
      });
    } else if (event.type === 'customer.updated') {
      const customer = event.data.object;

      return toPaykitEvent<Customer>({
        type: '$customerUpdated',
        created: event.created,
        id: event.id,
        data: toPaykitCustomer(customer),
      });
    } else if (event.type === 'customer.deleted') {
      return toPaykitEvent<Customer | null>({ type: '$customerDeleted', created: event.created, id: event.id, data: null });
    } else if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;

      return toPaykitEvent<Subscription>({
        type: '$subscriptionCreated',
        created: event.created,
        id: event.id,
        data: toPaykitSubscription(subscription),
      });
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;

      return toPaykitEvent<Subscription>({
        type: '$subscriptionUpdated',
        created: event.created,
        id: event.id,
        data: toPaykitSubscription(subscription),
      });
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;

      return toPaykitEvent<Subscription>({
        type: '$subscriptionCancelled',
        created: event.created,
        id: event.id,
        data: toPaykitSubscription(subscription),
      });
    } else if (event.type == 'invoice.paid') {
      const invoice = event.data.object;

      return toPaykitEvent<Invoice>({ type: '$invoicePaid', created: event.created, id: event.id, data: toPaykitInvoice(invoice) });
    }

    throw new Error(`Unhandled event type: ${event.type}`);
  };
}
