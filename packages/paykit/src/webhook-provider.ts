import { PayKitProvider } from './paykit-provider';
import { Checkout } from './resources/checkout';
import { Customer } from './resources/customer';
import { Subscription } from './resources/subscription';
import { WebhookEvent, WebhookHandler, WebhookProviderPayload } from './resources/webhook';
import { UnknownError } from './tools/error';

export interface WebhookConfig {
  provider: PayKitProvider;
  webhookSecret: string;

  /**
   * Customer events
   */
  onCustomerCreated?: WebhookHandler<Customer>;
  onCustomerUpdated?: WebhookHandler<Customer>;
  onCustomerDeleted?: WebhookHandler<Customer>;

  /**
   * Subscription events
   */
  onSubscriptionCreated?: WebhookHandler<Subscription>;
  onSubscriptionUpdated?: WebhookHandler<Subscription>;
  onSubscriptionCanceled?: WebhookHandler<Subscription>;

  /**
   * Checkout events
   */
  onCheckoutCreated?: WebhookHandler<Checkout>;
}

export class Webhook {
  constructor(
    private config: WebhookConfig,
    private opts: Omit<WebhookProviderPayload, 'webhookSecret'>,
  ) {}

  handle = async (): Promise<void> => {
    const { provider, ...handlers } = this.config;

    const event = await provider.handleWebhook({ ...this.opts, webhookSecret: this.config.webhookSecret });

    switch (event.type) {
      case 'customer.created':
        return handlers.onCustomerCreated?.(event as WebhookEvent<Customer>);
      case 'customer.updated':
        return handlers.onCustomerUpdated?.(event as WebhookEvent<Customer>);
      case 'customer.deleted':
        return handlers.onCustomerDeleted?.(event as WebhookEvent<Customer>);
      case 'subscription.created':
        return handlers.onSubscriptionCreated?.(event as WebhookEvent<Subscription>);
      case 'subscription.updated':
        return handlers.onSubscriptionUpdated?.(event as WebhookEvent<Subscription>);
      case 'subscription.canceled':
        return handlers.onSubscriptionCanceled?.(event as WebhookEvent<Subscription>);
      case 'checkout.created':
        return handlers.onCheckoutCreated?.(event as WebhookEvent<Checkout>);
      default:
        throw new UnknownError(`Unknown event type: ${event.type}`, { provider: this.config.provider.constructor.name });
    }
  };
}
