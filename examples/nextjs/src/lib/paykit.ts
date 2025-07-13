import { PayKit } from '@paykit-sdk/core';
import type { 
  PayKitProvider, 
  CreateCheckoutParams, 
  CreateCustomerParams, 
  UpdateSubscriptionParams, 
  UpdateCustomerParams,
  Subscription,
  Customer,
  Checkout,
  $ExtWebhookHandlerConfig,
  PaykitProviderOptions,
  WebhookEventPayload
} from '@paykit-sdk/core';

// HTTP-based local provider that uses API routes to read/write .paykit/config.json
interface HttpLocalConfig extends PaykitProviderOptions {
  paymentUrl: string;
  baseUrl: string;
}

interface PaykitConfig {
  product: { name: string; description: string; price: string; itemId: string };
  customer: Partial<Customer>;
  subscriptions: Array<Subscription>;
  checkouts: Array<Checkout>;
  payments: Array<string>;
}

class HttpLocalProvider implements PayKitProvider {
  constructor(private config: HttpLocalConfig) {}

  private async apiRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api/paykit/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  private getKeyValue = async <T extends keyof PaykitConfig>(key: T): Promise<PaykitConfig[T] | null> => {
    try {
      const result = await this.apiRequest(`config?key=${key}`);
      return result.success ? result.data : null;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return null;
    }
  };

  private updateKey = async <T extends keyof PaykitConfig>(key: T, value: PaykitConfig[T]): Promise<boolean> => {
    try {
      const result = await this.apiRequest('config', {
        method: 'POST',
        body: JSON.stringify({ key, value }),
      });
      return result.success;
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
      return false;
    }
  };

  private updateSubscriptionHelper = async (id: string, updates: Partial<Subscription>) => {
    const subscriptions = await this.getKeyValue('subscriptions');
    
    if (!subscriptions) {
      throw new Error('Subscriptions not found');
    }

    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === id) ?? -1;

    if (subscriptionIndex === -1) {
      throw new Error('Subscription not found');
    }

    const updatedSubscriptions = [...subscriptions];
    updatedSubscriptions[subscriptionIndex] = { ...updatedSubscriptions[subscriptionIndex], ...updates };

    await this.updateKey('subscriptions', updatedSubscriptions);

    return updatedSubscriptions[subscriptionIndex];
  };

  createCheckout = async (params: CreateCheckoutParams) => {
    const { customer_id, session_type, item_id, metadata } = params;

    const checkout: Checkout = {
      id: `checkout_${Date.now()}`,
      amount: 2999, // $29.99 for demo
      currency: 'USD',
      customer_id: customer_id || 'demo_customer',
      metadata: metadata || {},
      payment_url: `${this.config.paymentUrl}?checkout_id=${Date.now()}`,
      session_type: session_type,
      products: [{ id: item_id, quantity: 1 }],
    };

    // Store checkout
    const checkouts = await this.getKeyValue('checkouts') || [];
    checkouts.push(checkout);
    await this.updateKey('checkouts', checkouts);

    return checkout;
  };

  retrieveCheckout = async (id: string) => {
    const checkouts = await this.getKeyValue('checkouts') || [];
    const checkout = checkouts.find(c => c.id === id);
    
    if (!checkout) {
      throw new Error('Checkout not found');
    }

    return checkout;
  };

  createCustomer = async (params: CreateCustomerParams) => {
    const customer: Customer = {
      id: `customer_${Date.now()}`,
      name: params.name,
      email: params.email,
      metadata: params.metadata || {},
    };

    await this.updateKey('customer', customer);
    return customer;
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    const customer: Customer = {
      id,
      name: params.name,
      email: params.email,
      metadata: params.metadata || {},
    };

    await this.updateKey('customer', customer);
    return customer;
  };

  retrieveCustomer = async (id: string) => {
    const customer = await this.getKeyValue('customer');
    
    if (!customer || !customer.id) {
      // Return demo customer data
      return {
        id,
        name: 'Demo Customer',
        email: 'demo@example.com',
        metadata: {},
      };
    }

    return { ...customer, id } as Customer;
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams) => {
    return this.updateSubscriptionHelper(id, params);
  };

  cancelSubscription = async (id: string) => {
    return this.updateSubscriptionHelper(id, { status: 'canceled' });
  };

  retrieveSubscription = async (id: string) => {
    const subscriptions = await this.getKeyValue('subscriptions') || [];
    const subscription = subscriptions.find(sub => sub.id === id);

    if (!subscription) {
      // Return demo subscription
      return {
        id,
        customer_id: 'demo_customer',
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {},
      } as Subscription;
    }

    return subscription;
  };

  handleWebhook = async (payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
    const { body } = payload;
    
    try {
      const parsedBody = JSON.parse(body);
      const { type, data } = parsedBody as { type: string; data: Record<string, any> };

      console.log(`Webhook received: ${type}`, data);
      
      // Return a properly typed webhook event
      return {
        type: '$checkoutCreated',
        created: Date.now(),
        id: data.id || `event_${Date.now()}`,
        data: data as Checkout,
      };
    } catch (error) {
      throw new Error('Invalid webhook body');
    }
  };
}

// Create HTTP-based local provider
export const provider = new HttpLocalProvider({
  debug: true,
  baseUrl: 'http://localhost:3000',
  paymentUrl: 'http://localhost:3000/checkout'
});

export const paykit = new PayKit(provider); 