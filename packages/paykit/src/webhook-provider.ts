import { PayKitProvider } from './paykit-provider';
import {
  CheckoutCreated,
  CustomerCreated,
  CustomerDeleted,
  CustomerUpdated,
  SubscriptionCanceled,
  SubscriptionCreated,
  SubscriptionUpdated,
  PaymentReceived,
} from './resources/webhook';
import { UnknownError } from './tools/error';

export type WebhookHandler = Partial<{
  $customerCreated: (event: CustomerCreated) => Promise<void>;
  $customerUpdated: (event: CustomerUpdated) => Promise<void>;
  $customerDeleted: (event: CustomerDeleted) => Promise<void>;
  $subscriptionCreated: (event: SubscriptionCreated) => Promise<void>;
  $subscriptionUpdated: (event: SubscriptionUpdated) => Promise<void>;
  $subscriptionCanceled: (event: SubscriptionCanceled) => Promise<void>;
  $checkoutCreated: (event: CheckoutCreated) => Promise<void>;
  $paymentReceived: (event: PaymentReceived) => Promise<void>;
}>;

export type WebhookConfig = {
  provider: PayKitProvider;
  webhookSecret: string;
  body: string;
  headers: Record<string, string | string[]>;
};

export class Webhook {
  constructor(
    private config: WebhookConfig,
    private handlers: WebhookHandler,
  ) {}

  handle = async (): Promise<void> => {
    const event = await this.config.provider.handleWebhook(this.config);

    switch (event.type) {
      case '$customerCreated':
        return this.handlers.$customerCreated?.(event as CustomerCreated);
      case '$customerUpdated':
        return this.handlers.$customerUpdated?.(event as CustomerUpdated);
      case '$customerDeleted':
        return this.handlers.$customerDeleted?.(event as CustomerDeleted);
      case '$subscriptionCreated':
        return this.handlers.$subscriptionCreated?.(event as SubscriptionCreated);
      case '$subscriptionUpdated':
        return this.handlers.$subscriptionUpdated?.(event as SubscriptionUpdated);
      case '$subscriptionCanceled':
        return this.handlers.$subscriptionCanceled?.(event as SubscriptionCanceled);
      case '$checkoutCreated':
        return this.handlers.$checkoutCreated?.(event as CheckoutCreated);
      case '$paymentReceived':
        return this.handlers.$paymentReceived?.(event as PaymentReceived);
      default:
        throw new UnknownError(`Unknown event type: ${event.type}`, { provider: this.config.provider.constructor.name });
    }
  };
}
