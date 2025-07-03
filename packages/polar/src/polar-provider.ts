import {
  toPaykitEvent,
  WebhookEventPayload,
  CreateCustomerParams,
  Customer,
  UpdateCustomerParams,
  Checkout,
  CreateCheckoutParams,
  Subscription,
  UpdateSubscriptionParams,
  WebhookConfig,
  headersExtractor,
  PayKitProvider,
  PaykitProviderOptions,
} from '@paykit-sdk/core';
import { Polar, SDKOptions, ServerList } from '@polar-sh/sdk';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { toPaykitCheckout, toPaykitCustomer, toPaykitSubscription } from '../lib/mapper';

export interface PolarConfig extends PaykitProviderOptions<SDKOptions> {}

export class PolarProvider implements PayKitProvider {
  private polar: Polar;

  private readonly productionURL = ServerList['production'];
  private readonly sandboxURL = ServerList['sandbox'];

  constructor(private config: PolarConfig) {
    const { accessToken, server, ...rest } = config;
    this.polar = new Polar({ accessToken, serverURL: server === 'sandbox' ? this.sandboxURL : this.productionURL, ...rest });
  }

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { metadata, item_id, provider_metadata } = params;
    const response = await this.polar.checkouts.create({
      metadata,
      products: [item_id],
      ...provider_metadata,
    });
    return toPaykitCheckout(response);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    const response = await this.polar.checkouts.get({ id });
    return toPaykitCheckout(response);
  };

  /**
   * Customer management
   */
  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    const { email, name, metadata } = params;
    const response = await this.polar.customers.create({ email, name, ...(metadata && { metadata }) });
    return toPaykitCustomer(response);
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams): Promise<Customer> => {
    const { email, name, metadata } = params;
    const response = await this.polar.customers.update({ id, customerUpdate: { email, name, ...(metadata && { metadata }) } });
    return toPaykitCustomer(response);
  };

  retrieveCustomer = async (id: string): Promise<Customer> => {
    const response = await this.polar.customers.get({ id });
    return toPaykitCustomer(response);
  };

  /**
   * Subscription management
   */
  cancelSubscription = async (id: string): Promise<Subscription> => {
    const response = await this.polar.subscriptions.revoke({ id });
    return toPaykitSubscription(response);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const response = await this.polar.subscriptions.get({ id });
    return toPaykitSubscription(response);
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams): Promise<Subscription> => {
    // currently we don't support updating a subscription for polar
    const subscription = await this.retrieveSubscription(id);
    return subscription;
  };

  /**
   * Webhook management
   */
  handleWebhook = async (params: WebhookConfig): Promise<WebhookEventPayload> => {
    const { body, headers, webhookSecret } = params;

    const webhookHeaders = headersExtractor(headers, ['webhook-id', 'webhook-timestamp', 'webhook-signature']).reduce(
      (acc, kv) => {
        acc[kv.key] = Array.isArray(kv.value) ? kv.value.join(',') : kv.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    const webhookEvent = validateEvent(body, webhookHeaders, webhookSecret);

    const id = webhookHeaders['webhook-id'];
    const timestamp = webhookHeaders['webhook-timestamp'];

    if (webhookEvent.type === 'subscription.updated') {
      const subscription = await this.retrieveSubscription(webhookEvent.data.id);
      return toPaykitEvent<Subscription>({ type: '$subscriptionUpdated', created: parseInt(timestamp), id, data: subscription });
    } else if (webhookEvent.type === 'subscription.created') {
      const subscription = await this.retrieveSubscription(webhookEvent.data.id);
      return toPaykitEvent<Subscription>({ type: '$subscriptionCreated', created: parseInt(timestamp), id, data: subscription });
    } else if (webhookEvent.type === 'subscription.revoked') {
      const subscription = await this.retrieveSubscription(webhookEvent.data.id);
      return toPaykitEvent<Subscription>({ type: '$subscriptionCanceled', created: parseInt(timestamp), id, data: subscription });
    } else if (webhookEvent.type === 'customer.created') {
      const customer = await this.retrieveCustomer(webhookEvent.data.id);
      return toPaykitEvent<Customer>({ type: '$customerCreated', created: parseInt(timestamp), id, data: customer });
    } else if (webhookEvent.type === 'customer.updated') {
      const customer = await this.retrieveCustomer(webhookEvent.data.id);
      return toPaykitEvent<Customer>({ type: '$customerUpdated', created: parseInt(timestamp), id, data: customer });
    } else if (webhookEvent.type === 'customer.deleted') {
      return toPaykitEvent<Customer | null>({ type: '$customerDeleted', created: parseInt(timestamp), id, data: null });
    } else if (webhookEvent.type === 'checkout.created') {
      const checkout = await this.retrieveCheckout(webhookEvent.data.id);
      return toPaykitEvent<Checkout>({ type: '$checkoutCreated', created: parseInt(timestamp), id, data: checkout });
    }

    throw new Error(`Unknown event type: ${webhookEvent.type}`);
  };
}
