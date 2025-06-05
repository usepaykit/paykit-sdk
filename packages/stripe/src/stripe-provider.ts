import Stripe from 'stripe';

/**
 * Todo: resolve import from paykit package
 */
import { Checkout, CreateCheckoutParams } from '../../paykit/src/resources/checkout';
import { CreateCustomerParams, Customer, UpdateCustomerParams } from '../../paykit/src/resources/customer';
import { Subscription, UpdateSubscriptionParams } from '../../paykit/src/resources/subscription';
import { WithPaymentProviderConfig } from '../../paykit/src/types';
import { toPaykitCheckout, toPaykitCustomer, toPaykitSubscription } from '../lib/mapper';
import { PayKitProvider } from './../../paykit/src/paykit-provider';

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
}
