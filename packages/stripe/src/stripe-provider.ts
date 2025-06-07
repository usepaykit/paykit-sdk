import { PayKitProvider } from '@paykit-sdk/core/src/paykit-provider';
import {
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Subscription,
  UpdateSubscriptionParams,
  toPaykitEvent,
  WebhookEventPayload,
  InternalWebhookHandlerParams,
} from '@paykit-sdk/core/src/resources';
import { WithPaymentProviderConfig } from '@paykit-sdk/core/src/types';
import Stripe from 'stripe';
import { toPaykitCheckout, toPaykitCustomer, toPaykitSubscription } from '../lib/mapper';

export interface StripeConfig extends WithPaymentProviderConfig<Stripe.StripeConfig> {
  apiVersion?: Stripe.LatestApiVersion;
}

export class StripeProvider implements PayKitProvider {
  private stripe: Stripe;

  constructor(config: StripeConfig) {
    const { apiKey, ...rest } = config;
    this.stripe = new Stripe(apiKey, rest);
  }

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { customer_id, price_id, quantity, ...rest } = params;
    const checkout = await this.stripe.checkout.sessions.create({ customer: customer_id, line_items: [{ price: price_id, quantity }], ...rest });
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
  handleWebhook = async (params: InternalWebhookHandlerParams): Promise<WebhookEventPayload> => {
    const { payload, signature, secret } = params;
    const event = this.stripe.webhooks.constructEvent(payload, signature, secret);

    if (event.type === 'checkout.session.completed') {
      const checkout = await this.retrieveCheckout(event.data.object.id);
      return toPaykitEvent<Checkout>({ type: 'checkout.created', created: event.created, id: event.id, data: checkout });
    } else if (event.type === 'customer.created') {
      const customer = await this.retrieveCustomer(event.data.object.id);
      return toPaykitEvent<Customer | null>({ type: 'customer.created', created: event.created, id: event.id, data: customer });
    } else if (event.type === 'customer.updated') {
      const customer = await this.retrieveCustomer(event.data.object.id);
      return toPaykitEvent<Customer | null>({ type: 'customer.updated', created: event.created, id: event.id, data: customer });
    } else if (event.type === 'customer.deleted') {
      return toPaykitEvent<Customer | null>({ type: 'customer.deleted', created: event.created, id: event.id, data: null });
    } else if (event.type === 'customer.subscription.created') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: 'subscription.created', created: event.created, id: event.id, data: subscription });
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: 'subscription.updated', created: event.created, id: event.id, data: subscription });
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: 'subscription.canceled', created: event.created, id: event.id, data: subscription });
    } else if (event.type === 'customer.subscription.paused') {
      const subscription = await this.retrieveSubscription(event.data.object.id);
      return toPaykitEvent<Subscription>({ type: 'subscription.updated', created: event.created, id: event.id, data: subscription });
    }

    throw new Error(`Unknown event type: ${event.type}`);
  };
}
