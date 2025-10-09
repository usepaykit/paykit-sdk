import { CreateSubscriptionSchema, HTTPClient, Subscription, UpdateSubscriptionSchema } from '@paykit-sdk/core';
import { PayPalConfig } from '../paypal-provider';
import { MAX_METADATA_LENGTH } from './core-api';

export class PayPalSubscriptionApi {
  private _client: HTTPClient;
  private baseUrl: string;

  constructor(config: PayPalConfig) {
    this.baseUrl = config.isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

    this._client = new HTTPClient({
      baseUrl: this.baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  createSubscription = async (params: CreateSubscriptionSchema): Promise<Subscription> => {
    const accessToken = '';

    // params.item_id should be a PayPal plan_id (e.g., P-XX12345)
    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: params.item_id,
        subscriber: {
          email_address: params.metadata?.email || 'customer@example.com',
        },
        application_context: {
          user_action: 'SUBSCRIBE_NOW',
          return_url: params.metadata?.return_url || 'https://example.com/return',
          cancel_url: params.metadata?.cancel_url || 'https://example.com/cancel',
        },
        custom_id: params.metadata?.session_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create subscription: ${response.statusText}`);
    }

    const subscription: PayPalSubscription = await response.json();
    return this.mapPayPalSubscription(subscription);
  };

  createSubscription$1 = async (params: CreateSubscriptionSchema) => {
    const accessToken = '';

    const stringifiedMetadata = JSON.stringify(params.metadata);

    if (stringifiedMetadata.length > MAX_METADATA_LENGTH) {
      throw new Error('Metadata is too long, max 127 characters when stringified');
    }

    if (typeof params.customer === 'string') {
      throw new Error('Customer must be an object with an email');
    }

    // params.item_id should be a PayPal plan_id (e.g., P-XX12345)
    const subscription = await this._client.post('/v1/billing/subscriptions', {
      body: {
        plan_id: params.item_id,
        subscriber: {
          email_address: params.customer.email,
        },
        application_context: {
          ...(params.provider_metadata?.cancel_url && { cancel_url: params.provider_metadata.cancel_url }),
          ...(params.provider_metadata?.return_url && { return_url: params.provider_metadata.return_url }),
        },
        custom_id: stringifiedMetadata,
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return null;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionSchema): Promise<Subscription> => {
    const accessToken = '';

    // PayPal allows updating billing info, shipping, custom_id
    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          op: 'replace',
          path: '/custom_id',
          value: params.metadata?.session_id || '',
        },
      ]),
    });

    if (!response.ok) {
      throw new Error(`Failed to update subscription: ${response.statusText}`);
    }

    return this.retrieveSubscription(id);
  };

  retrieveSubscription = async (id: string): Promise<Subscription> => {
    const accessToken = '';

    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve subscription: ${response.statusText}`);
    }

    const subscription: PayPalSubscription = await response.json();
    return this.mapPayPalSubscription(subscription);
  };

  cancelSubscription = async (id: string): Promise<Subscription> => {
    const accessToken = '';

    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Customer requested cancellation',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${response.statusText}`);
    }

    // Retrieve updated subscription
    return this.retrieveSubscription(id);
  };

  deleteSubscription = async (id: string): Promise<null> => {
    await this.cancelSubscription(id);
    return null;
  };
}
