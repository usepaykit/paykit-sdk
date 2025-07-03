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
  $SchemaPaymentReceived,
  WebhookConfig,
} from '@paykit-sdk/core';
import Stripe from 'stripe';
import { toPaykitCheckout, toPaykitCustomer, toPaykitSubscription } from '../lib/mapper';

export interface StripeConfig extends PaykitProviderOptions<Stripe.StripeConfig> {
  apiKey: string;
}

export class StripeProvider implements PayKitProvider {
  private stripe: Stripe;

  constructor(config: StripeConfig) {
    const { debug, apiKey, ...rest } = config;

    // todo: use debug mode internally

    this.stripe = new Stripe(apiKey, rest);
  }

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { customer_id, item_id, metadata, session_type, provider_metadata } = params;
    const checkout = await this.stripe.checkout.sessions.create({
      customer: customer_id,
      metadata,
      line_items: [{ price: item_id }],
      mode: session_type === 'one_time' ? 'payment' : 'subscription',
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

  deleteCustomer = async (id: string): Promise<void> => {
    await this.stripe.customers.del(id);
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    const customer = await this.stripe.customers.retrieve(id);
    if ('deleted' in customer) return null;
    return toPaykitCustomer(customer);
  };

  /**
   * Subscription management
   */
  cancelSubscription = async (id: string): Promise<Subscription> => {
    const subscription = await this.stripe.subscriptions.cancel(id);
    return toPaykitSubscription(subscription);
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
  handleWebhook = async (params: WebhookConfig): Promise<WebhookEventPayload> => {
    const { body, headers, webhookSecret } = params;

    const stripeHeaders = headersExtractor(headers, ['x-stripe-signature']);
    const signature = stripeHeaders[0].value;

    const event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const checkout = await this.retrieveCheckout(event.data.object.id);
      const response = toPaykitEvent<Checkout>({ type: '$checkoutCreated', created: event.created, id: event.id, data: checkout });
      return response;
    } else if (event.type === 'customer.created') {
      const customer = await this.createCustomer({ email: event.data.object.email!, name: event.data.object.name ?? undefined });
      return toPaykitEvent<Customer>({ type: '$customerCreated', created: event.created, id: event.id, data: customer });
    } else if (event.type === 'customer.updated') {
      const { email, name } = event.data.object;
      const customer = await this.updateCustomer(event.data.object.id, { email: email!, name: name ?? undefined });
      return toPaykitEvent<Customer>({ type: '$customerUpdated', created: event.created, id: event.id, data: customer });
    } else if (event.type === 'customer.deleted') {
      await this.deleteCustomer(event.data.object.id);
      return toPaykitEvent<null>({ type: '$customerDeleted', created: event.created, id: event.id, data: null });
    } else if (event.type === 'customer.subscription.created') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: '$subscriptionCreated', created: event.created, id: event.id, data: subscription });
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: '$subscriptionUpdated', created: event.created, id: event.id, data: subscription });
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: '$subscriptionCanceled', created: event.created, id: event.id, data: subscription });
    } else if (event.type === 'customer.subscription.paused') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: '$subscriptionUpdated', created: event.created, id: event.id, data: subscription });
    } else if (event.type == 'invoice.payment_succeeded') {
      const checkoutId = event.data.object.metadata?.checkoutId;
      if (!checkoutId) throw new Error('Checkout ID not found in invoice metadata');
      const checkout = await this.retrieveCheckout(checkoutId);
      return toPaykitEvent<$SchemaPaymentReceived>({
        type: '$paymentReceived',
        created: event.created,
        id: event.id,
        data: { ...checkout, checkoutId },
      });
    }

    throw new Error(`Unknown event type: ${event.type}`);
  };
}
