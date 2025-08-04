import 'server-only';
import {
  Checkout,
  Customer,
  Invoice,
  LooseAutoComplete,
  PaykitMetadata,
  safeEncode,
  Subscription,
  ValidationError,
  Webhook,
  WebhookEvent,
  WebhookEventLiteral,
  WebhookEventPayload,
} from '@paykit-sdk/core';
import { nanoid } from 'nanoid';
import { __defaultPaykitConfig, getKeyValue, updateKey } from './tools';
import { parseJsonValues } from './utils';

type WebhookResource = 'checkout' | 'customer' | 'subscription' | 'invoice';

type CheckoutWithProviderMetadata = Checkout & { provider_metadata: PaykitMetadata };

/**
 * Utils
 */
const createWebhookEvent = <T extends LooseAutoComplete<WebhookEventLiteral>, Resource>(type: T, data: Resource): WebhookEvent<Resource> => ({
  id: `evt_${nanoid(30)}`,
  type: type as WebhookEventLiteral,
  created: Date.now(),
  data,
});

const productHandlers = {
  retrieve: async (id: string) => {
    const product = await getKeyValue('product');
    return product?.itemId === id ? product : null;
  },
};

const customerHandlers = {
  create: async (customer: Customer) => {
    await updateKey('customer', customer);
    return customer;
  },

  retrieve: async (id: string) => {
    const customer = await getKeyValue('customer');
    return customer?.id === id ? customer : null;
  },

  update: async (customer: Customer) => {
    await updateKey('customer', customer);
    return customer;
  },

  delete: async (id: string) => {
    const customer = await getKeyValue('customer');

    if (!customer) throw new ValidationError('Customer not found', {});

    if (customer.id === id) await updateKey('customer', __defaultPaykitConfig().customer);

    return null;
  },
};

const checkoutHandlers = {
  create: async (checkout: Checkout) => {
    await updateKey('checkouts', [...((await getKeyValue('checkouts')) || []), checkout]);
    return checkout;
  },

  retrieve: async (id: string) => {
    const checkouts = (await getKeyValue('checkouts')) || [];
    return checkouts.find(checkout => checkout.id === id) ?? null;
  },

  createWithMetadata: async (data: Record<string, any>) => {
    const product = await productHandlers.retrieve(data.item_id);

    if (!product) throw new ValidationError('Product not found', {});

    const customer = await customerHandlers.retrieve(data.customer_id);

    if (!customer) throw new ValidationError('Customer not found', {});

    const amount = await (async () => {
      if (product?.price) return product?.price;

      // Overriding the amount from the product
      if (data.provider_metadata?.amount) {
        return parseInt(data.provider_metadata.amount as string, 10);
      }
      return 25;
    })();

    const providerMetadata: PaykitMetadata = {
      customerName: customer.name ?? '',
      customerEmail: customer.email ?? '',
      webhookUrl: data.webhookUrl,
      productName: product.name,
    };

    const checkoutData = {
      amount,
      customer_id: data.customer_id,
      metadata: data.metadata,
      session_type: data.session_type,
      products: [{ id: data.item_id, quantity: 1 }],
      currency: data.provider_metadata?.currency ?? 'USD',
      provider_metadata: providerMetadata,
    } as Omit<CheckoutWithProviderMetadata, 'id' | 'payment_url'>;

    const flowId = safeEncode(checkoutData);

    if (!flowId.ok) throw new ValidationError('Failed to create checkout', {});

    const checkout = {
      ...checkoutData,
      id: flowId.value,
      payment_url: `${data.paymentUrl}/checkout?id=${flowId.value}`,
    } as CheckoutWithProviderMetadata;

    const { provider_metadata, ...checkoutWithoutProviderMetadata } = checkout;
    await checkoutHandlers.create(checkoutWithoutProviderMetadata);

    return checkoutWithoutProviderMetadata;
  },
};

const subscriptionHandlers = {
  create: async (subscription: Subscription) => {
    await updateKey('subscriptions', [...((await getKeyValue('subscriptions')) || []), subscription]);
    return subscription;
  },

  retrieve: async (id: string) => {
    const subscriptions = (await getKeyValue('subscriptions')) || [];
    return subscriptions.find(sub => sub.id === id) ?? null;
  },

  update: async (id: string, updateFn: (record: Subscription) => Subscription) => {
    const subscriptions = await getKeyValue('subscriptions');

    if (!subscriptions) throw new ValidationError('Subscriptions not found', {});

    const index = subscriptions.findIndex(sub => sub.id === id);

    if (index === -1) throw new ValidationError('Subscription not found', {});

    const updatedSubscriptions = [...subscriptions];

    updatedSubscriptions[index] = updateFn(updatedSubscriptions[index]!);

    await updateKey('subscriptions', updatedSubscriptions);

    return updatedSubscriptions[index]!;
  },

  updateMetadata: async (id: string, metadata: Record<string, any>) => {
    return subscriptionHandlers.update(id, record => ({ ...record, metadata: { ...record.metadata, ...metadata } }));
  },

  cancel: async (id: string) => {
    return subscriptionHandlers.update(id, record => ({ ...record, status: 'canceled' }));
  },
};

const invoiceHandlers = {
  create: async (invoice: Invoice) => {
    await updateKey('invoices', [...((await getKeyValue('invoices')) || []), invoice]);
    return invoice;
  },
};

const webhookEventHandlers = {
  /**
   * Checkout
   */
  $checkoutCreated: async (data: Record<string, any>) => {
    const result = await checkoutHandlers.createWithMetadata(data);
    return { result, event: createWebhookEvent('$checkoutCreated', result) };
  },
  $checkoutRetrieved: async (data: Record<string, any>) => {
    const result = await checkoutHandlers.retrieve(data.id);
    return { result, event: createWebhookEvent('$checkoutRetrieved', result) };
  },

  /**
   * Customer
   */
  $customerCreated: async (data: Record<string, any>) => {
    const result = await customerHandlers.create(data as Customer);
    return { result, event: createWebhookEvent('$customerCreated', result) };
  },
  $customerRetrieved: async (data: Record<string, any>) => {
    const result = await customerHandlers.retrieve(data.id);
    return { result, event: createWebhookEvent('$customerRetrieved', result) };
  },
  $customerUpdated: async (data: Record<string, any>) => {
    const result = await customerHandlers.update(data as Customer);
    return { result, event: createWebhookEvent('$customerUpdated', result) };
  },
  $customerDeleted: async (data: Record<string, any>) => {
    const result = await customerHandlers.delete(data.id);
    return { result, event: createWebhookEvent('$customerDeleted', result) };
  },

  /**
   * Subscription
   */
  $subscriptionCreated: async (data: Record<string, any>) => {
    const result = await subscriptionHandlers.create(data as Subscription);
    return { result, event: createWebhookEvent('$subscriptionCreated', result) };
  },
  $subscriptionUpdated: async (data: Record<string, any>) => {
    const result = await subscriptionHandlers.updateMetadata(data.id, data.metadata);
    return { result, event: createWebhookEvent('$subscriptionUpdated', result) };
  },
  $subscriptionCancelled: async (data: Record<string, any>) => {
    const result = await subscriptionHandlers.cancel(data.id);
    return { result, event: createWebhookEvent('$subscriptionCancelled', result) };
  },
  $subscriptionRetrieved: async (data: Record<string, any>) => {
    const result = await subscriptionHandlers.retrieve(data.id);
    return { result, event: createWebhookEvent('$subscriptionRetrieved', result) };
  },

  /**
   * Invoice
   */
  $invoicePaid: async (data: Record<string, any>) => {
    const result = await invoiceHandlers.create(data as Invoice);
    return { result, event: createWebhookEvent('$invoicePaid', result) };
  },
};

/**
 * Webhook
 */
export const server$HandleWebhook = async (url: string, webhook: Webhook): Promise<WebhookEventPayload> => {
  const urlParams = new URLSearchParams(new URL(url).searchParams.toString());

  const resource = urlParams.get('resource') as WebhookResource;

  if (!resource) throw new ValidationError('Missing resource parameter', {});

  const type = urlParams.get('type') as LooseAutoComplete<WebhookEventLiteral>;

  if (!type) throw new ValidationError('Missing type parameter', {});

  const bodyParam = urlParams.get('body');

  if (!bodyParam) throw new ValidationError('Missing body parameter', {});

  const data = JSON.parse(bodyParam) as Record<string, any>;

  const parsedData = parseJsonValues(data);

  const typeHandler = webhookEventHandlers[type as keyof typeof webhookEventHandlers];

  const { result, event } = await typeHandler(parsedData);

  try {
    const webhookWithHandlers = webhook as unknown as { handlers: Map<string, ((event: WebhookEventLiteral) => Promise<void>)[]> };
    const handlers = webhookWithHandlers.handlers?.get(type as string);

    if (handlers && handlers.length > 0) {
      await Promise.all(handlers.map((handler: (event: any) => Promise<void>) => handler(result)));
    }
  } catch (error) {
    throw new ValidationError('Failed to call webhook handlers', { cause: error });
  }

  return event as WebhookEventPayload;
};
