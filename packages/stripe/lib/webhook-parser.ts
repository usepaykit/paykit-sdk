import { Checkout } from '../../paykit/src/resources/checkout';
import { Customer } from '../../paykit/src/resources/customer';
import { WebhookConfig, WebhookEvent, WebhookEventLiteral, WebhookEventPayload } from '../../paykit/src/webhook-provider';

export const stripeWebhookParser = async (
  paykitEvent: WebhookEventLiteral,
  eventHandler: Omit<WebhookConfig, 'provider' | 'webhookSecret'>,
  payload: WebhookEventPayload,
) => {
  if (paykitEvent === 'checkout.created') {
    return eventHandler.onCheckoutCreated?.(payload as WebhookEvent<Checkout>);
  } else if (paykitEvent === 'customer.created') {
    return eventHandler.onCustomerCreated?.(payload as WebhookEvent<Customer>);
  } else if (paykitEvent === 'customer.updated') {
    return eventHandler.onCustomerUpdated?.(payload as WebhookEvent<Customer>);
  } else if (paykitEvent === 'customer.deleted') {
    return eventHandler.onCustomerDeleted?.(payload as WebhookEvent<Customer>);
  }
};
