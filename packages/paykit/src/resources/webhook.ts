import { Checkout } from './checkout';
import { Customer } from './customer';
import { Subscription } from './subscription';

export type WebhookEventLiteral =
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'checkout.created';

export interface WebhookEvent<T extends any> {
  /**
   * The ID of the webhook event.
   */
  id: string;
  /**
   * The type of the webhook event.
   */
  type: string;
  /**
   * The created timestamp of the webhook event.
   */
  created: number;
  /**
   * The data of the webhook event.
   */
  data: T;
}

export type WebhookHandler<T extends any> = (event: WebhookEvent<T>) => Promise<void>;

export type WebhookEventPayload = WebhookEvent<Checkout> | WebhookEvent<Customer | null> | WebhookEvent<Subscription>;

export interface WebhookPayload {
  body: string;
  headers: Record<string, string | string[]>;
}

export interface WebhookProviderPayload extends WebhookPayload {
  webhookSecret: string;
}

export const toPaykitEvent = <T extends any>(event: { id: string; type: WebhookEventLiteral; created: number; data: T }): WebhookEvent<T> => event;
