import { WebhookError } from './error';
import { PayKitProvider } from './paykit-provider';
import {
  CustomerCreated,
  CustomerDeleted,
  CustomerUpdated,
  SubscriptionCanceled,
  SubscriptionCreated,
  SubscriptionUpdated,
  InvoiceGenerated,
  WebhookEventPayload,
  PaymentCreated,
  PaymentUpdated,
  PaymentCanceled,
  RefundCreated,
} from './resources/webhook';

export type WebhookEventHandlers = Partial<{
  'customer.created': (event: CustomerCreated) => Promise<any>;
  'customer.updated': (event: CustomerUpdated) => Promise<any>;
  'customer.deleted': (event: CustomerDeleted) => Promise<any>;
  'subscription.created': (event: SubscriptionCreated) => Promise<any>;
  'subscription.updated': (event: SubscriptionUpdated) => Promise<any>;
  'subscription.canceled': (event: SubscriptionCanceled) => Promise<any>;
  'payment.created': (event: PaymentCreated) => Promise<any>;
  'payment.updated': (event: PaymentUpdated) => Promise<any>;
  'payment.canceled': (event: PaymentCanceled) => Promise<any>;
  'refund.created': (event: RefundCreated) => Promise<any>;
  'invoice.generated': (event: InvoiceGenerated) => Promise<any>;
}>;

export type WebhookEventType = keyof WebhookEventHandlers;

export type WebhookSetupConfig = {
  /**
   * The secret key for the webhook.
   */
  webhookSecret: string;

  /**
   * The provider for the webhook.
   */
  provider: PayKitProvider;
};

export type WebhookHandlerConfig = {
  /**
   * The raw body of the webhook.
   */
  body: string;

  /**
   * The headers of the webhook.
   */
  headers: Record<string, string | string[]>;

  /**
   * The full URL of the webhook.
   */
  fullUrl: string;
};

export interface HandleWebhookParams
  extends WebhookHandlerConfig,
    Pick<WebhookSetupConfig, 'webhookSecret'> {}

export class Webhook {
  private handlers: Map<
    WebhookEventType,
    ((event: WebhookEventPayload) => Promise<void>)[]
  > = new Map();
  private config: WebhookSetupConfig | null = null;

  setup(config: WebhookSetupConfig): Webhook {
    this.config = config;
    return this;
  }

  on<T extends WebhookEventType>(
    eventType: T,
    handler: NonNullable<WebhookEventHandlers[T]>,
  ): Webhook {
    if (!this.config) {
      throw new WebhookError('Webhook not configured. Call setup() first.');
    }

    if (!this.handlers.has(eventType)) this.handlers.set(eventType, []);

    this.handlers
      .get(eventType)
      ?.push(handler as (event: WebhookEventPayload) => Promise<any>);
    return this;
  }

  async handle(dto: WebhookHandlerConfig): Promise<void> {
    if (!this.config) {
      throw new WebhookError('Webhook not configured. Call setup() first.');
    }

    const { webhookSecret, provider } = this.config;
    const events = await provider.handleWebhook({ ...dto, webhookSecret });

    for (const event of events) {
      const handlers = this.handlers.get(event.type);

      if (handlers && handlers.length > 0) {
        await Promise.all(handlers.map(handler => handler(event)));
      }
    }
  }
}
