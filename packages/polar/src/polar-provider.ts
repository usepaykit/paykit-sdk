import { Polar, SDKOptions } from '@polar-sh/sdk';
import { PayKitProvider } from '../../paykit/src/paykit-provider';
import { Checkout, CreateCheckoutParams } from '../../paykit/src/resources/checkout';
import { CreateCustomerParams, Customer, UpdateCustomerParams } from '../../paykit/src/resources/customer';
import { Subscription, UpdateSubscriptionParams } from '../../paykit/src/resources/subscription';
import { toPaykitEvent, WebhookEventLiteral, WebhookEventPayload } from '../../paykit/src/resources/webhook';
import { WithPaymentProviderConfig } from '../../paykit/src/types';
import { toPaykitCheckout, toPaykitCustomer, toPaykitSubscription } from '../lib/mapper';

export interface PolarConfig extends WithPaymentProviderConfig<Omit<SDKOptions, 'accessToken'>> {}

export class PolarProvider implements PayKitProvider {
  private polar: Polar;

  private readonly productionURL = 'https://api.polar.sh';
  private readonly sandboxURL = 'https://api.sandbox.polar.sh';

  constructor(private config: PolarConfig) {
    const { apiKey, environment = 'test', ...rest } = config;
    this.polar = new Polar({ ...rest, accessToken: apiKey, serverURL: environment === 'test' ? this.sandboxURL : this.productionURL });
  }

  /**
   * Checkout management
   */
  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    const { metadata, success_url, price_id } = params;
    const response = await this.polar.checkouts.create({ ...(metadata && { metadata }), successUrl: success_url, products: [price_id] });
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
  handleWebhook = async (payload: string, signature: string, secret: string): Promise<WebhookEventPayload> => {
    const response = await this.polar.events.get({ id: payload });

    /**
     * Todo: finalize the mapping
     */
    return toPaykitEvent({
      data: response as any,
      created: new Date(response.timestamp).getTime(),
      id: response.id,
      type: response.name as WebhookEventLiteral,
    });
  };
}
