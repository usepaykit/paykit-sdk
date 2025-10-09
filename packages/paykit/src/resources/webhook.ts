import { WebhookEventType } from '../webhook-provider';
import { Checkout } from './checkout';
import { Customer } from './customer';
import { Invoice } from './invoice';
import { Payment } from './payment';
import { Refund } from './refund';
import { Subscription } from './subscription';

export interface WebhookEvent<T extends any> {
  /**
   * The ID of the webhook event.
   */
  id: string;

  /**
   * The type of the webhook event.
   */
  type: WebhookEventType;

  /**
   * The created timestamp of the webhook event.
   */
  created: number;

  /**
   * The data of the webhook event.
   */
  data: T;
}

export type CheckoutCreated = WebhookEvent<Checkout>;
export type CheckoutUpdated = WebhookEvent<Checkout>;
export type CheckoutDeleted = WebhookEvent<Checkout | null>;

export type CustomerCreated = WebhookEvent<Customer>;
export type CustomerUpdated = WebhookEvent<Customer | null>;
export type CustomerDeleted = WebhookEvent<Customer | null>;

export type SubscriptionCreated = WebhookEvent<Subscription>;
export type SubscriptionUpdated = WebhookEvent<Subscription | null>;
export type SubscriptionCanceled = WebhookEvent<Subscription | null>;

export type PaymentCreated = WebhookEvent<Payment>;
export type PaymentUpdated = WebhookEvent<Payment | null>;
export type PaymentCanceled = WebhookEvent<Payment | null>;

export type RefundCreated = WebhookEvent<Refund>;

export type InvoiceGenerated = WebhookEvent<Invoice>;

export type WebhookEventPayload =
  | CheckoutCreated
  | CheckoutUpdated
  | CheckoutDeleted
  | CustomerCreated
  | CustomerUpdated
  | CustomerDeleted
  | SubscriptionCreated
  | SubscriptionUpdated
  | SubscriptionCanceled
  | PaymentCreated
  | PaymentUpdated
  | PaymentCanceled
  | RefundCreated
  | InvoiceGenerated;

export const paykitEvent$InboundSchema = <Resource>(event: WebhookEvent<Resource>) => event;
