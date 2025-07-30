import 'server-only';
import {
  $ExtWebhookHandlerConfig,
  Checkout,
  Customer,
  safeDecode,
  Subscription,
  toPaykitEvent,
  ValidationError,
  WebhookEventPayload,
} from '@paykit-sdk/core';
import { __defaultPaykitConfig, getKeyValue, PaykitConfig, updateKey } from './tools';

/**
 * Product
 */
export const server$UpdateProduct = async (productId: string) => {
  const decoded = safeDecode<PaykitConfig['product']>(productId);

  if (!decoded.ok) return null;

  const product = decoded.value;

  await updateKey('product', product);

  return product;
};

/**
 * Checkout
 */
export const server$CreateCheckout = async (checkout: Checkout) => {
  await updateKey('checkouts', [...((await getKeyValue('checkouts')) || []), checkout]);
  return checkout;
};

/**
 * Customer
 */

export const server$CreateCustomer = async (customer: Customer) => {
  await updateKey('customer', customer);

  return customer;
};

export const server$PutCustomer = async (customer: Customer) => {
  await updateKey('customer', customer);

  return customer;
};

export const server$DeleteCustomer = async (id: string) => {
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

export const server$CreateSubscription = async (subscription: Subscription) => {
  await updateKey('subscriptions', [...((await getKeyValue('subscriptions')) || []), subscription]);

  return subscription;
};

export const server$UpdateSubscriptionHelper = async (id: string, params: Partial<Subscription>) => {
  const subscriptions = await getKeyValue('subscriptions');

  if (!subscriptions) throw new ValidationError('Subscriptions not found', { cause: 'Subscriptions not found' });

  const subscriptionIndex = subscriptions.findIndex(sub => sub.id === id) ?? -1;

  if (subscriptionIndex === -1) throw new ValidationError('Subscription not found', { cause: 'Subscription not found' });

  const updatedSubscriptions = [...subscriptions];
  updatedSubscriptions[subscriptionIndex] = { ...updatedSubscriptions[subscriptionIndex], ...params };

  await updateKey('subscriptions', updatedSubscriptions);

  return updatedSubscriptions[subscriptionIndex];
};

/**
 * Payment
 */
export const server$CreatePayment = async (paymentId: string) => {
  await updateKey('payments', [...((await getKeyValue('payments')) || []), paymentId]);
  return paymentId;
};

/**
 * Webhook
 */
export const server$HandleWebhook = async (payload: $ExtWebhookHandlerConfig): Promise<WebhookEventPayload> => {
  const { body } = payload;

  console.dir(body, { depth: 100 });

  const parsedBody = body as unknown as Record<string, any>;

  const { type, data } = parsedBody as { type: string; data: Record<string, any> };

  if (type === 'checkout.created') {
    server$UpdateProduct(data.product_id);
    return toPaykitEvent<Checkout>({ type: '$checkoutCreated', created: Date.now(), id: `wk_${data.id}`, data: data as Checkout });
  } else if (type == 'customer.created') {
    const customer = data as Customer;
    await server$CreateCustomer(customer);
    return toPaykitEvent<Customer>({ type: '$customerCreated', created: Date.now(), id: `wk_${data.id}`, data: customer });
  } else if (type == 'customer.updated') {
    const customer = data as Customer;
    await server$PutCustomer(customer);
    return toPaykitEvent<Customer>({ type: '$customerUpdated', created: Date.now(), id: `wk_${data.id}`, data: customer });
  } else if (type == 'customer.deleted') {
    await server$DeleteCustomer(data.id);
    return toPaykitEvent<null>({ type: '$customerDeleted', created: Date.now(), id: data.id, data: null });
  } else if (type == 'subscription.created') {
    const subscription = data as Subscription;
    await server$CreateSubscription(subscription);
    return toPaykitEvent<Subscription>({ type: '$subscriptionCreated', created: Date.now(), id: data.id, data: subscription });
  } else if (type == 'subscription.updated') {
    const subscription = data as Subscription;
    await server$UpdateSubscriptionHelper(subscription.id, subscription);
    return toPaykitEvent<Subscription>({ type: '$subscriptionUpdated', created: Date.now(), id: data.id, data: subscription });
  } else if (type == 'subscription.deleted') {
    await server$UpdateSubscriptionHelper(data.id, { status: 'canceled' });
    return toPaykitEvent<null>({ type: '$subscriptionCanceled', created: Date.now(), id: data.id, data: null });
  } else if (type == 'payment.succeeded') {
    const paymentId = data.id;
    await server$CreatePayment(paymentId);
    return toPaykitEvent<{ id: string }>({ type: '$paymentReceived', created: Date.now(), id: `wk_${paymentId}`, data: { id: paymentId } });
  }

  throw new ValidationError('Unknown webhook type', {});
};
