import { PayKitProvider } from './paykit-provider';
import {
  CheckoutCreated,
  CustomerCreated,
  CustomerDeleted,
  CustomerUpdated,
  subscriptionCancelled,
  SubscriptionCreated,
  SubscriptionUpdated,
  PaymentReceived,
  WebhookEventPayload,
} from './resources/webhook';

export type WebhookEventHandlers = Partial<{
  $customerCreated: (event: CustomerCreated) => Promise<void>;
  $customerUpdated: (event: CustomerUpdated) => Promise<void>;
  $customerDeleted: (event: CustomerDeleted) => Promise<void>;
  $subscriptionCreated: (event: SubscriptionCreated) => Promise<void>;
  $subscriptionUpdated: (event: SubscriptionUpdated) => Promise<void>;
  $subscriptionCancelled: (event: subscriptionCancelled) => Promise<void>;
  $checkoutCreated: (event: CheckoutCreated) => Promise<void>;
  $paymentReceived: (event: PaymentReceived) => Promise<void>;
}>;

export type WebhookEventType = keyof WebhookEventHandlers;

export type WebhookSetupConfig = {
  webhookSecret: string;
  provider: PayKitProvider;
};

export type WebhookHandlerConfig = {
  body: string;
  headers: Record<string, string | string[]>;
};

export type $ExtWebhookHandlerConfig = WebhookHandlerConfig & Pick<WebhookSetupConfig, 'webhookSecret'>;

export class Webhook {
  private handlers: Map<WebhookEventType, ((event: WebhookEventPayload) => Promise<void>)[]> = new Map();
  private config: WebhookSetupConfig | null = null;

  setup(config: WebhookSetupConfig): Webhook {
    this.config = config;
    return this;
  }

  on<T extends WebhookEventType>(eventType: T, handler: NonNullable<WebhookEventHandlers[T]>): Webhook {
    if (!this.config) throw new Error('Webhook not configured. Call setup() first.');

    if (!this.handlers.has(eventType)) this.handlers.set(eventType, []);

    this.handlers.get(eventType)?.push(handler as (event: WebhookEventPayload) => Promise<void>);
    return this;
  }

  async handle(dto: WebhookHandlerConfig): Promise<void> {
    if (!this.config) throw new Error('Webhook not configured. Call setup() first.');

    const { webhookSecret, provider } = this.config;
    const event = await provider.handleWebhook({ ...dto, webhookSecret });
    const handlers = this.handlers.get(event.type as WebhookEventType);

    if (handlers && handlers.length > 0) {
      await Promise.all(handlers.map(handler => handler(event)));
    }
  }
}
