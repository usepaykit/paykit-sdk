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
  id: string;
  type: string;
  created: number;
  data: T;
}

export type WebhookHandler<T extends any> = (event: WebhookEvent<T>) => Promise<void>;

export type WebhookEventPayload = WebhookEvent<Checkout> | WebhookEvent<Customer | null> | WebhookEvent<Subscription>;

export const toPaykitEvent = <T extends any>(event: { id: string; type: WebhookEventLiteral; created: number; data: T }): WebhookEvent<T> => event;
