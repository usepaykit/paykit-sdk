import 'server-only';
import { Checkout, Customer, Subscription, toPaykitEvent, ValidationError, Webhook, WebhookEventPayload } from '@paykit-sdk/core';
import { __defaultPaykitConfig, getKeyValue, updateKey } from './tools';
import { parseJsonValues } from './utils';

/**
 * Checkout
 */
const server$CreateCheckout = async (checkout: Checkout) => {
  await updateKey('checkouts', [...((await getKeyValue('checkouts')) || []), checkout]);
  return checkout;
};

/**
 * Customer
 */

const server$CreateCustomer = async (customer: Customer) => {
  await updateKey('customer', customer);

  return customer;
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

const server$UpdateSubscriptionHelper = async (id: string, params: Partial<Subscription>) => {
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
const server$CreatePayment = async (paymentId: string) => {
  await updateKey('payments', [...((await getKeyValue('payments')) || []), paymentId]);
  return paymentId;
};

/**
 * Webhook
 */
export const server$HandleWebhook = async (dto: { url: string; webhook: Webhook }): Promise<WebhookEventPayload> => {
  const { url, webhook: _ } = dto;

  const urlParams = new URL(url).searchParams.toString();

  if (!urlParams) throw new ValidationError('Invalid webhook URL', { cause: 'Invalid webhook URL' });

  const decodedData = decodeURIComponent(urlParams);

  const webhookData = JSON.parse(decodedData) as { type: string; data: Record<string, any> };

  const { type, data } = webhookData;

  const parsedData = parseJsonValues(data);

  console.log({ parsedData });

  if (type === 'checkout.created') {
    await server$CreateCheckout(parsedData as Checkout);
    return toPaykitEvent<Checkout>({ type: '$checkoutCreated', created: Date.now(), id: `wk_${parsedData.id}`, data: parsedData as Checkout });
  } else if (type == 'customer.created') {
    const customer = parsedData as Customer;
    await server$CreateCustomer(customer);
    return toPaykitEvent<Customer>({ type: '$customerCreated', created: Date.now(), id: `wk_${parsedData.id}`, data: customer });
  } else if (type == 'customer.updated') {
    const customer = parsedData as Customer;
    await server$PutCustomer(customer);
    return toPaykitEvent<Customer>({ type: '$customerUpdated', created: Date.now(), id: `wk_${parsedData.id}`, data: customer });
  } else if (type == 'customer.deleted') {
    await server$DeleteCustomer(parsedData.id);
    return toPaykitEvent<null>({ type: '$customerDeleted', created: Date.now(), id: parsedData.id, data: null });
  } else if (type == 'subscription.created') {
    const subscription = parsedData as Subscription;
    await server$CreateSubscription(subscription);
    return toPaykitEvent<Subscription>({ type: '$subscriptionCreated', created: Date.now(), id: parsedData.id, data: subscription });
  } else if (type == 'subscription.updated') {
    const subscription = parsedData as Subscription;
    await server$UpdateSubscriptionHelper(subscription.id, subscription);
    return toPaykitEvent<Subscription>({ type: '$subscriptionUpdated', created: Date.now(), id: parsedData.id, data: subscription });
  } else if (type == 'subscription.deleted') {
    await server$UpdateSubscriptionHelper(parsedData.id, { status: 'canceled' });
    return toPaykitEvent<null>({ type: '$subscriptionCanceled', created: Date.now(), id: parsedData.id, data: null });
  } else if (type == 'payment.succeeded') {
    const paymentId = parsedData.id;
    await server$CreatePayment(paymentId);
    return toPaykitEvent<{ id: string }>({ type: '$paymentReceived', created: Date.now(), id: `wk_${paymentId}`, data: { id: paymentId } });
  }

  console.log('Unknown webhook type error message', { type, data });

  throw new ValidationError('Unknown webhook type', {});
};
