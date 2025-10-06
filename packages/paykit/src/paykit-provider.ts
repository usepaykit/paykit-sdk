import { Checkout, CreateCheckoutParams } from './resources/checkout';
import { CreateCustomerParams, Customer, UpdateCustomerParams } from './resources/customer';
import { Subscription, UpdateSubscriptionParams } from './resources/subscription';
import { WebhookEventPayload } from './resources/webhook';
import { HandleWebhookParams } from './webhook-provider';

export interface PayKitProvider {
  /**
   * The name of the provider implementation
   */
  readonly providerName: string;

  /**
   * Checkout sessions
   */
  createCheckout(params: CreateCheckoutParams): Promise<Checkout>;
  retrieveCheckout(id: string): Promise<Checkout | null>;

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
  cancelSubscription(id: string): Promise<null>;
  retrieveSubscription(id: string): Promise<Subscription | null>;

  /**
   * Webhook management
   */
  handleWebhook(payload: HandleWebhookParams): Promise<WebhookEventPayload>;
}
