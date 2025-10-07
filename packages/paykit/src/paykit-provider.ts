import { Checkout, CreateCheckoutParams, UpdateCheckoutParams } from './resources/checkout';
import { CreateCustomerParams, Customer, UpdateCustomerParams } from './resources/customer';
import { CreatePaymentSchema, Payment, UpdatePaymentSchema } from './resources/payment';
import { CreateRefundSchema, Refund } from './resources/refund';
import { CreateSubscriptionSchema, Subscription, UpdateSubscriptionSchema } from './resources/subscription';
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
  updateCheckout(id: string, params: UpdateCheckoutParams): Promise<Checkout>;
  deleteCheckout(id: string): Promise<null>;

  /**
   * Customer management
   */
  createCustomer(params: CreateCustomerParams): Promise<Customer>;
  updateCustomer(id: string, params: UpdateCustomerParams): Promise<Customer>;
  retrieveCustomer(id: string): Promise<Customer | null>;
  deleteCustomer(id: string): Promise<null>;

  /**
   * Subscription management
   */
  createSubscription(params: CreateSubscriptionSchema): Promise<Subscription>;
  updateSubscription(id: string, params: UpdateSubscriptionSchema): Promise<Subscription>;
  cancelSubscription(id: string): Promise<Subscription>;
  deleteSubscription(id: string): Promise<null>;
  retrieveSubscription(id: string): Promise<Subscription | null>;

  /**
   * Payment management
   */
  createPayment(params: CreatePaymentSchema): Promise<Payment>;
  updatePayment(id: string, params: UpdatePaymentSchema): Promise<Payment>;
  retrievePayment(id: string): Promise<Payment | null>;
  deletePayment(id: string): Promise<null>;
  capturePayment(id: string): Promise<Payment>;
  cancelPayment(id: string): Promise<Payment>;

  /**
   * Refund management
   */
  createRefund(params: CreateRefundSchema): Promise<Refund>;

  /**
   * Webhook management
   */
  handleWebhook(payload: HandleWebhookParams): Promise<WebhookEventPayload>;
}
