import { PayKitProvider } from './paykit-provider';
import { CreateCheckoutParams } from './resources/checkout';
import { CreateCustomerParams, UpdateCustomerParams } from './resources/customer';
import { UpdateSubscriptionParams } from './resources/subscription';
import { Webhook, WebhookConfig, WebhookHandler } from './webhook-provider';

class PayKit {
  constructor(private provider: PayKitProvider) {}

  checkouts = {
    create: (params: CreateCheckoutParams) => this.provider.createCheckout(params),
    retrieve: (id: string) => this.provider.retrieveCheckout(id),
  };

  customers = {
    create: (params: CreateCustomerParams) => this.provider.createCustomer(params),
    update: (id: string, params: UpdateCustomerParams) => this.provider.updateCustomer(id, params),
    retrieve: (id: string) => this.provider.retrieveCustomer(id),
  };

  subscriptions = {
    update: (id: string, params: UpdateSubscriptionParams) => this.provider.updateSubscription(id, params),
    cancel: (id: string) => this.provider.cancelSubscription(id),
  };

  webhooks = {
    listen: async (config: Omit<WebhookConfig, 'provider'>, handlers: WebhookHandler) => {
      const webhook = new Webhook({ ...config, provider: this.provider }, handlers);
      return await webhook.handle();
    },
  };
}

export { PayKit, PayKitProvider };

export * from './resources';
export * from './types';
export * from './tools';
export * from './logger';
export * from './webhook-provider';
export * from './http';
