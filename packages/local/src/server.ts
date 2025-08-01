import 'server-only';
import {
  Checkout,
  Customer,
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

type CheckoutWithProviderMetadata = Checkout & { provider_metadata: PaykitMetadata };

/**
 * Product
 */

const server$RetrieveProduct = async (id: string) => {
  const product = await getKeyValue('product');

  return product?.itemId == id ? product : null;
};

/**
 * Checkout
 */
const server$CreateCheckout = async (checkout: Checkout) => {
  await updateKey('checkouts', [...((await getKeyValue('checkouts')) || []), checkout]);

  return checkout;
};

const server$RetrieveCheckout = async (id: string) => {
  const checkouts = await getKeyValue('checkouts');

  return checkouts?.find(checkout => checkout.id === id) ?? null;
};

/**
 * Customer
 */

const server$CreateCustomer = async (customer: Customer) => {
  await updateKey('customer', customer);

  return customer;
};

const server$RetrieveCustomer = async (id: string) => {
  const customer = await getKeyValue('customer');

  return customer?.id == id ? customer : null;
};

const server$PutCustomer = async (customer: Customer) => {
  await updateKey('customer', customer);

  return customer;
};

const server$DeleteCustomer = async (id: string) => {
  const customer = await getKeyValue('customer');

  if (!customer) throw new ValidationError('Customer not found', { cause: 'Customer not found' });

  if (customer.id === id) {
    await updateKey('customer', __defaultPaykitConfig().customer);
  }

  return null;
};

/**
 * Subscription
 */

const server$CreateSubscription = async (subscription: Subscription) => {
  await updateKey('subscriptions', [...((await getKeyValue('subscriptions')) || []), subscription]);

  return subscription;
};

const server$RetrieveSubscription = async (id: string) => {
  const subscriptions = await getKeyValue('subscriptions');

  return subscriptions?.find(sub => sub.id === id) ?? null;
};

const server$UpdateSubscriptionHelper = async (id: string, updateData: (record: Subscription) => Subscription) => {
  const subscriptions = await getKeyValue('subscriptions');

  if (!subscriptions) throw new ValidationError('Subscriptions not found', { cause: 'Subscriptions not found' });

  const subscriptionIndex = subscriptions.findIndex(sub => sub.id === id) ?? -1;

  if (subscriptionIndex === -1) throw new ValidationError('Subscription not found', { cause: 'Subscription not found' });

  const updatedSubscriptions = [...subscriptions];
  const currentSubscription = updatedSubscriptions[subscriptionIndex];

  const updatedSubscription = updateData(currentSubscription);

  updatedSubscriptions[subscriptionIndex] = updatedSubscription;

  await updateKey('subscriptions', updatedSubscriptions);

  return updatedSubscriptions[subscriptionIndex];
};

/**
 * Payment
 */
const server$CreatePayment = async (paymentId: string) => {
  await updateKey('payments', [...((await getKeyValue('payments')) || []), paymentId]);

  return paymentId;
};

const makeWebhookEvent = <T extends LooseAutoComplete<WebhookEventLiteral>, Resource>(type: T, data: Resource) => {
  return { id: `evt_${nanoid(30)}`, type, created: Date.now(), data } as WebhookEvent<Resource>;
};

/**
 * Webhook
 */
export const server$HandleWebhook = async (url: string, webhook: Webhook): Promise<WebhookEventPayload> => {
  const urlParams = new URL(url).searchParams.toString();

  const urlSearchParams = new URLSearchParams(urlParams);

  const resource = urlSearchParams.get('resource');

  const type = urlSearchParams.get('type') as LooseAutoComplete<WebhookEventLiteral>;

  const bodyParam = urlSearchParams.get('body');

  if (!bodyParam) throw new ValidationError('Missing body parameter', {});

  const data = JSON.parse(bodyParam) as Record<string, any>;

  const parsedData = parseJsonValues(data);

  console.log({ parsedData });

  if (!resource) throw new ValidationError('Missing resource parameter', {});

  let result: any;
  let webhookEvent: WebhookEventPayload | null = null;

  if (resource == 'checkout') {
    switch (type) {
      case '$checkoutCreated':
        const amount = (async () => {
          const product = await server$RetrieveProduct(parsedData.item_id);

          if (product && product['price']) return product['price'];

          if (parsedData.provider_metadata?.['amount']) return parseInt(parsedData.provider_metadata?.['amount'] as string, 10);

          return 25;
        })();

        const product = await server$RetrieveProduct(parsedData.item_id);

        if (!product) throw new ValidationError('Product not found', {});

        const customer = await server$RetrieveCustomer(parsedData.customer_id);

        if (!customer) throw new ValidationError('Customer not found', {});

        const providerMetadata = {
          customerName: customer.name,
          customerEmail: customer.email,
          webhookUrl: parsedData.webhookUrl,
          productName: product.name,
        };

        const checkoutWithoutPaymentAndId = {
          amount: await amount,
          customer_id: parsedData.customer_id,
          metadata: parsedData.metadata,
          session_type: parsedData.session_type,
          products: [{ id: parsedData.item_id, quantity: 1 }],
          currency: (parsedData.provider_metadata?.['currency'] as string) ?? 'USD',
          provider_metadata: providerMetadata,
        } as Omit<Checkout, 'id' | 'payment_url'>;

        const flowId = safeEncode(checkoutWithoutPaymentAndId);

        if (!flowId.ok) throw new ValidationError('Failed to create checkout', {});

        const checkout = {
          ...checkoutWithoutPaymentAndId,
          id: flowId.value,
          payment_url: `${parsedData.paymentUrl}/checkout?id=${flowId.value}`,
        } as CheckoutWithProviderMetadata;

        const { provider_metadata, ...checkoutData } = checkout;

        await server$CreateCheckout(checkoutData as Checkout);

        result = checkoutData;
        webhookEvent = makeWebhookEvent<'$checkoutCreated', Checkout>('$checkoutCreated', checkoutData);
        break;

      case '$checkoutRetrieved':
        result = await server$RetrieveCheckout(parsedData.id);
        webhookEvent = makeWebhookEvent<'$checkoutRetrieved', Checkout>('$checkoutRetrieved', result);
        break;

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  } else if (resource == 'customer') {
    switch (type) {
      case '$customerCreated':
        await server$CreateCustomer(parsedData as Customer);
        result = parsedData as Customer;
        webhookEvent = makeWebhookEvent<'$customerCreated', Customer>('$customerCreated', result);
        break;

      case '$customerRetrieved':
        result = await server$RetrieveCustomer(parsedData.id);
        webhookEvent = makeWebhookEvent<'$customerRetrieved', Customer>('$customerRetrieved', result);
        break;

      case '$customerUpdated':
        await server$PutCustomer(parsedData as Customer);
        result = parsedData as Customer;
        webhookEvent = makeWebhookEvent<'$customerUpdated', Customer>('$customerUpdated', result);
        break;

      case '$customerDeleted':
        await server$DeleteCustomer(parsedData.id);
        result = null;
        webhookEvent = makeWebhookEvent<'$customerDeleted', Customer | null>('$customerDeleted', result);
        break;

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  } else if (resource == 'subscription') {
    switch (type) {
      case '$subscriptionCreated':
        await server$CreateSubscription(parsedData as Subscription);
        result = parsedData as Subscription;
        webhookEvent = makeWebhookEvent<'$subscriptionCreated', Subscription>('$subscriptionCreated', result);
        break;

      case '$subscriptionUpdated':
        await server$UpdateSubscriptionHelper(parsedData.id, record => ({ ...record, metadata: { ...record.metadata, ...parsedData.metadata } }));
        result = parsedData as Subscription;
        webhookEvent = makeWebhookEvent<'$subscriptionUpdated', Subscription>('$subscriptionUpdated', result);
        break;

      case '$subscriptionCancelled':
        await server$UpdateSubscriptionHelper(parsedData.id, record => ({ ...record, status: 'canceled' }));
        result = null;
        webhookEvent = makeWebhookEvent<'$subscriptionCancelled', Subscription>('$subscriptionCancelled', result);
        break;

      case '$subscriptionRetrieved':
        result = await server$RetrieveSubscription(parsedData.id);
        console.log({ result });
        webhookEvent = makeWebhookEvent<'$subscriptionRetrieved', Subscription>('$subscriptionRetrieved', result);
        break;

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  } else if (resource == 'payment') {
    switch (type) {
      case '$paymentReceived':
        await server$CreatePayment(parsedData.id);
        result = parsedData as { id: string };
        webhookEvent = makeWebhookEvent<'$paymentReceived', { id: string }>('$paymentReceived', result);
        break;

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  } else {
    console.log('Unknown webhook type error message', { type, data });
    throw new ValidationError('Unknown webhook type', {});
  }

  try {
    const webhookWithHandlers = webhook as unknown as { handlers: Map<string, ((event: any) => Promise<void>)[]> };
    const handlers = webhookWithHandlers.handlers?.get(type as string);

    if (handlers && handlers.length > 0) {
      await Promise.all(handlers.map((handler: (event: any) => Promise<void>) => handler(result)));
    }
  } catch (error) {
    throw new ValidationError('Error calling webhook handlers', {});
  }

  return webhookEvent as WebhookEventPayload;
};
