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
  UpdateSubscriptionParams,
  WebhookEventPayload,
} from '@paykit-sdk/core';

export interface StellarOptions
  extends PaykitProviderOptions<{
    /**
     * The API key for the Paykit Cloud, this includes SEP for network (e.g public, testnet, etc.)
     */
    apiKey: string;

    /**
     * Th assets supported
     */
    assets: Array<{ issuer: string; code: string }>;

    /**
     * The developer's webhook URL
     */
    webhookUrl: string;
  }> {}

export class StellarProvider implements PayKitProvider {
  constructor(private readonly opts: StellarOptions) {}

  /**
   * MAPPING IMPLEMENTATION
   * customer_id: userStellarAccount (This is the Stellar account ID of the user making the payment)
   * item_id: Used by Paykit to identify the product/subscription, but not directly passed to Stellar.
   * session_type: 'one_time' or 'recurring' (maps to SEP-24 interactive flow details).
   * currency: the asset code (e.g. USDC, etc.)
   * metadata: any additional information about the payment
   */

  readonly providerName = 'stellar';

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

  updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  retrieveSubscription(id: string): Promise<Subscription> {
    throw new Error('Method not implemented.');
  }

  cancelSubscription(id: string): Promise<null> {
    throw new Error('Method not implemented.');
  }

  handleWebhook(payload: HandleWebhookParams): Promise<WebhookEventPayload> {
    throw new Error('Method not implemented.');
  }
}
