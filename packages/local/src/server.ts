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
  WebhookEventLiteral,
} from '@paykit-sdk/core';
import { nanoid } from 'nanoid';
import { __defaultPaykitConfig, getKeyValue, updateKey } from './tools';
import { parseJsonValues } from './utils';

type CheckoutWithProviderMetadata = Omit<Checkout, 'id' | 'payment_url'> & { provider_metadata: PaykitMetadata };

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

/**
 * Webhook
 */
export const server$HandleWebhook = async (dto: { url: string; webhook: Webhook }) => {
  const { url, webhook: _ } = dto;

  const urlParams = new URL(url).searchParams.toString();

  console.log({ urlParams });

  if (!urlParams) throw new ValidationError('Invalid webhook URL', { cause: 'Invalid webhook URL' });

  const decodedData = decodeURIComponent(urlParams);

  console.log({ decodedData });

  const webhookData = JSON.parse(decodedData) as { type: LooseAutoComplete<WebhookEventLiteral>; data: Record<string, any> };

  const { type, data } = webhookData;

  const parsedData = parseJsonValues(data);

  const resource: string = '';

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

        const checkoutWithoutPayment = {
          id: `ch_${nanoid(30)}`,
          amount: await amount,
          customer_id: parsedData.customer_id,
          metadata: parsedData.metadata,
          session_type: parsedData.session_type,
          products: [{ id: parsedData.item_id, quantity: 1 }],
          currency: (parsedData.provider_metadata?.['currency'] as string) ?? 'USD',
          provider_metadata: providerMetadata,
        } as CheckoutWithProviderMetadata;

        const flowId = safeEncode(checkoutWithoutPayment);

        if (!flowId.ok) throw new ValidationError('Failed to create checkout', {});

        const checkout = {
          ...checkoutWithoutPayment,
          id: flowId.value,
          payment_url: `${parsedData.webhookUrl}/checkout?id=${flowId.value}`,
        } as CheckoutWithProviderMetadata;

        const { provider_metadata, ...checkoutData } = checkout;

        await server$CreateCheckout(checkoutData as Checkout);

        return checkout;

      case '$checkoutRetrieved':
        return await server$RetrieveCheckout(parsedData.id);

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  } else if (resource == 'customer') {
    switch (type) {
      case '$customerCreated':
        await server$CreateCustomer(parsedData as Customer);
        return parsedData as Customer;

      case '$customerRetrieved':
        return await server$RetrieveCustomer(parsedData.id);

      case '$customerUpdated':
        await server$PutCustomer(parsedData as Customer);
        return parsedData as Customer;

      case '$customerDeleted':
        await server$DeleteCustomer(parsedData.id);
        return null;

      case '$customerRetrieved':
        return parsedData as Customer;

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  } else if (resource == 'subscription') {
    switch (type) {
      case '$subscriptionCreated':
        await server$CreateSubscription(parsedData as Subscription);
        return parsedData as Subscription;

      case '$subscriptionUpdated':
        await server$UpdateSubscriptionHelper(parsedData.id, record => ({ ...record, metadata: { ...record.metadata, ...parsedData } }));
        return parsedData as Subscription;

      case '$subscriptionCancelled':
        await server$UpdateSubscriptionHelper(parsedData.id, record => ({ ...record, status: 'canceled' }));
        return null;

      case '$subscriptionRetrieved':
        return await server$RetrieveSubscription(parsedData.id);

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  } else if (resource == 'payment') {
    switch (type) {
      case '$paymentReceived':
        await server$CreatePayment(parsedData.id);
        return parsedData as { id: string };

      default:
        throw new ValidationError('Unknown webhook type', {});
    }
  }

  console.log('Unknown webhook type error message', { type, data });

  throw new ValidationError('Unknown webhook type', {});
};
