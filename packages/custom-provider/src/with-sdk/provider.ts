import {
  HandleWebhookParams,
  Checkout,
  CreateCheckoutParams,
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
  UpdateCheckoutParams,
  UpdatePaymentSchema,
} from '@paykit-sdk/core';

export interface WithProviderSDKOptions extends PaykitProviderOptions<{ apiKey: string }> {}

export class WithProviderSDK implements PayKitProvider {
  constructor(private readonly opts: WithProviderSDKOptions) {}

  readonly providerName = 'with-sdk';

  updateCheckout(id: string, params: UpdateCheckoutParams): Promise<Checkout> {
    throw new Error('Method not implemented.');
  }

  deleteCheckout(id: string): Promise<null> {
    throw new Error('Method not implemented.');
  }

  deleteCustomer(id: string): Promise<null> {
    throw new Error('Method not implemented.');
  }

  createSubscription(params: CreateSubscriptionSchema): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  deleteSubscription(id: string): Promise<null> {
    throw new Error('Method not implemented.');
  }

  createPayment(params: CreatePaymentSchema): Promise<Payment> {
    throw new Error('Method not implemented.');
  }

  updatePayment(id: string, params: UpdatePaymentSchema): Promise<Payment> {
    throw new Error('Method not implemented.');
  }

  retrievePayment(id: string): Promise<Payment | null> {
    throw new Error('Method not implemented.');
  }

  deletePayment(id: string): Promise<null> {
    throw new Error('Method not implemented.');
  }

  capturePayment(id: string): Promise<Payment> {
    throw new Error('Method not implemented.');
  }

  cancelPayment(id: string): Promise<Payment> {
    throw new Error('Method not implemented.');
  }

  createRefund(params: CreateRefundSchema): Promise<Refund> {
    throw new Error('Method not implemented.');
  }

  createCheckout(checkout: CreateCheckoutParams): Promise<Checkout> {
    throw new Error('Method not implemented.');
  }

  retrieveCheckout(id: string): Promise<Checkout> {
    throw new Error('Method not implemented.');
  }

  createCustomer(params: CreateCustomerParams): Promise<Customer> {
    throw new Error('Method not implemented.');
  }

  retrieveCustomer(id: string): Promise<Customer> {
    throw new Error('Method not implemented.');
  }

  updateCustomer(id: string, params: UpdateCustomerParams): Promise<Customer> {
    throw new Error('Method not implemented.');
  }

  updateSubscription(id: string, params: UpdateSubscriptionSchema): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  retrieveSubscription(id: string): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  cancelSubscription(id: string): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  handleWebhook(payload: HandleWebhookParams): Promise<Array<WebhookEventPayload>> {
    throw new Error('Method not implemented.');
  }
}
