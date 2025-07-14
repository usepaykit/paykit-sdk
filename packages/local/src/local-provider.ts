import {
  PayKitProvider,
  CreateCheckoutParams,
  CreateCustomerParams,
  UpdateSubscriptionParams,
  Subscription,
  $ExtWebhookHandlerConfig,
  UpdateCustomerParams,
  PaykitProviderOptions,
  Checkout,
  Customer,
  WebhookEventPayload,
  HTTPClient,
  unwrapAsync,
  isBrowser,
  safeEncode,
  ValidationError,
  safeDecode,
  toPaykitEvent,
  safeParse,
} from '@paykit-sdk/core';
import {
  server$CreateCustomer,
  server$CreateCheckout,
  server$RetrieveCheckout,
  server$RetrieveCustomer,
  server$RetrieveSubscription,
  server$UpdateCustomer,
  server$UpdateSubscriptionHelper,
  server$HandleWebhook,
} from './server';
import { getKeyValue, updateKey } from './tools';

export interface LocalConfig extends PaykitProviderOptions {
  /**
   * Mainly used for React package to avoid using the server-side API
   * That's why a plugin for vite was created to proxy the API requests to the server-side API
   */
  apiUrl: string;

  /**
   * Payment URL
   */
  paymentUrl: string;
}

export class LocalProvider implements PayKitProvider {
  private _client: HTTPClient;

  constructor(private config: LocalConfig) {
    this._client = new HTTPClient({ baseUrl: config.apiUrl, headers: { 'Content-Type': 'application/json' } });
  }

  createCheckout = async (params: CreateCheckoutParams): Promise<Checkout> => {
    if (isBrowser) {
      return unwrapAsync(
        this._client.post<Checkout>(new URLSearchParams({ resource: 'checkout' }).toString(), {
          body: JSON.stringify(params),
        }),
      );
    }

    return server$CreateCheckout({ paymentUrl: this.config.paymentUrl }, params);
  };

  retrieveCheckout = async (id: string): Promise<Checkout> => {
    if (isBrowser) {
      return unwrapAsync(this._client.get<Checkout>(new URLSearchParams({ resource: 'checkout', id }).toString()));
    }

    return server$RetrieveCheckout(id);
  };

  createCustomer = async (params: CreateCustomerParams): Promise<Customer> => {
    if (isBrowser) {
      return unwrapAsync(this._client.post<Customer>(new URLSearchParams({ resource: 'customer' }).toString(), { body: JSON.stringify(params) }));
    }

    return server$CreateCustomer(params);
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    if (isBrowser) {
      return unwrapAsync(this._client.put<Customer>(new URLSearchParams({ resource: 'customer', id }).toString(), { body: JSON.stringify(params) }));
    }

    return server$UpdateCustomer(id, params);
  };

  retrieveCustomer = async (id: string): Promise<Customer | null> => {
    if (isBrowser) {
      return unwrapAsync(this._client.get<Customer>(new URLSearchParams({ resource: 'customer', id }).toString()));
    }

    return server$RetrieveCustomer(id);
  };

  async updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    return server$UpdateSubscriptionHelper(id, params);
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    return server$UpdateSubscriptionHelper(id, { status: 'canceled' });
  }

  async retrieveSubscription(id: string): Promise<Subscription> {
    if (isBrowser) {
      return unwrapAsync(this._client.get<Subscription>(new URLSearchParams({ resource: 'subscription', id }).toString()));
    }

    return server$RetrieveSubscription(id);
  }

  async handleWebhook(payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> {
    if (isBrowser) {
      return unwrapAsync(
        this._client.post<WebhookEventPayload>(new URLSearchParams({ resource: 'webhook' }).toString(), { body: JSON.stringify(payload) }),
      );
    }

    return server$HandleWebhook(payload);
  }
}
