import {
  HandleWebhookParams,
  Checkout,
  CreateCheckoutSchema,
  CreateCustomerParams,
  Customer,
  PayKitProvider,
  PaykitProviderOptions,
  Subscription,
  UpdateCustomerParams,
  UpdateSubscriptionSchema,
  WebhookEventPayload,
  CreatePaymentSchema,
  CreateRefundSchema,
  CreateSubscriptionSchema,
  Payment,
  Refund,
  UpdateCheckoutSchema,
  UpdatePaymentSchema,
  schema,
  AbstractPayKitProvider,
  NotImplementedError,
} from '@paykit-sdk/core';
import { z } from 'zod';

export interface WithProviderSDKOptions
  extends PaykitProviderOptions<{
    /**
     * The API key for the provider
     */
    apiKey: string;
  }> {}

const withProviderSDKOptionsSchema = schema<WithProviderSDKOptions>()(
  z.object({
    apiKey: z.string(),
  }),
);

const providerName = 'withSDK';

export class WithProviderSDK extends AbstractPayKitProvider implements PayKitProvider {
  readonly providerName = providerName;

  constructor(private readonly opts: WithProviderSDKOptions) {
    super(withProviderSDKOptionsSchema, opts, providerName);

    // init provider specific sdk with the options
  }

  updateCheckout(id: string, params: UpdateCheckoutSchema): Promise<Checkout> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  deleteCheckout(id: string): Promise<null> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  deleteCustomer(id: string): Promise<null> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  createSubscription(params: CreateSubscriptionSchema): Promise<Subscription> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  deleteSubscription(id: string): Promise<null> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  createPayment(params: CreatePaymentSchema): Promise<Payment> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  updatePayment(id: string, params: UpdatePaymentSchema): Promise<Payment> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  retrievePayment(id: string): Promise<Payment | null> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  deletePayment(id: string): Promise<null> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  capturePayment(id: string): Promise<Payment> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  cancelPayment(id: string): Promise<Payment> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  createRefund(params: CreateRefundSchema): Promise<Refund> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  createCheckout(checkout: CreateCheckoutSchema): Promise<Checkout> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  retrieveCheckout(id: string): Promise<Checkout> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  createCustomer(params: CreateCustomerParams): Promise<Customer> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  retrieveCustomer(id: string): Promise<Customer> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  updateCustomer(id: string, params: UpdateCustomerParams): Promise<Customer> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  updateSubscription(
    id: string,
    params: UpdateSubscriptionSchema,
  ): Promise<Subscription> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  retrieveSubscription(id: string): Promise<Subscription> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  cancelSubscription(id: string): Promise<Subscription> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }

  handleWebhook(payload: HandleWebhookParams): Promise<Array<WebhookEventPayload>> {
    throw new NotImplementedError('Method not implemented.', this.providerName, {
      futureSupport: true,
    });
  }
}
