import { Checkout, $SchemaPaymentReceived } from './checkout';
import { Customer } from './customer';
import { Subscription } from './subscription';

export type WebhookEventLiteral =
  | '$customerCreated'
  | '$customerUpdated'
  | '$customerDeleted'
  | '$subscriptionCreated'
  | '$subscriptionUpdated'
  | '$subscriptionCanceled'
  | '$checkoutCreated'
  | '$paymentReceived';

export interface WebhookEvent<T extends any> {
  /**
   * The ID of the webhook event.
   */
  id: string;

  /**
   * The type of the webhook event.
   */
  type: WebhookEventLiteral;

  /**
   * The created timestamp of the webhook event.
   */
  created: number;

  /**
   * The data of the webhook event.
   */
  data: T;
}

export type CustomerCreated = WebhookEvent<Customer>;
export type CustomerUpdated = WebhookEvent<Customer | null>;
export type CustomerDeleted = WebhookEvent<Customer | null>;

export type SubscriptionCreated = WebhookEvent<Subscription>;
export type SubscriptionUpdated = WebhookEvent<Subscription>;
export type SubscriptionCanceled = WebhookEvent<Subscription>;

export type CheckoutCreated = WebhookEvent<Checkout>;
export type PaymentReceived = WebhookEvent<$SchemaPaymentReceived>;

export type WebhookEventPayload =
  | CustomerCreated
  | CustomerUpdated
  | CustomerDeleted
  | SubscriptionCreated
  | SubscriptionUpdated
  | SubscriptionCanceled
  | PaymentReceived
  | CheckoutCreated;

export const toPaykitEvent = <Resource>(event: WebhookEvent<Resource>) => event;
