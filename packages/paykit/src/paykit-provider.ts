import { Checkout, CreateCheckoutParams } from './resources/checkout';
import { CreateCustomerParams, Customer, UpdateCustomerParams } from './resources/customer';
import { Subscription, UpdateSubscriptionParams } from './resources/subscription';
import { InternalWebhookHandlerParams, WebhookEventPayload } from './resources/webhook';

export interface PayKitProvider {
  /**
   * Checkout sessions
   */
  createCheckout(params: CreateCheckoutParams): Promise<Checkout>;
  retrieveCheckout(id: string): Promise<Checkout>;

  /**
   * Customer management
   */
  createCustomer(params: CreateCustomerParams): Promise<Customer>;
  updateCustomer(id: string, params: UpdateCustomerParams): Promise<Customer>;
  retrieveCustomer(id: string): Promise<Customer | null>;

  /**
   * Subscription management
   */
  updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription>;
  cancelSubscription(id: string): Promise<Subscription>;
  retrieveSubscription(id: string): Promise<Subscription>;

  /**
   * Webhook management
   */
  handleWebhook(params: InternalWebhookHandlerParams): Promise<WebhookEventPayload>;
}
