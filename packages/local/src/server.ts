import {
  $ExtWebhookHandlerConfig,
  Checkout,
  CreateCheckoutParams,
  CreateCustomerParams,
  Customer,
  safeDecode,
  safeEncode,
  safeParse,
  Subscription,
  toPaykitEvent,
  UpdateCustomerParams,
  ValidationError,
} from '@paykit-sdk/core';
import 'server-only';
import { getKeyValue, updateKey } from './tools';

export const server$ProcessCreateCheckout = async (checkout: Checkout) => {
  await updateKey('checkouts', [...((await getKeyValue('checkouts')) || []), checkout]);
  return checkout;
};

export const server$RetrieveCheckout = async (id: string) => {
  const decode = safeDecode<Checkout>(id);

  if (!decode.ok) throw new ValidationError(decode.error.message, { cause: 'Invalid checkout parameters' });

  return decode.value;
};

export const server$RetrieveCustomer = async (id: string) => {
  const customers = await getKeyValue('customers');

  if (!customers) return null;

  const customer = customers.find(cust => cust.id === id);

  return customer || null;
};

export const server$UpdateCustomer = async (_id: string, params: UpdateCustomerParams) => {
  const { email, name } = params;

  const dataEncoded = safeEncode(JSON.stringify({ email, name }));

  if (!dataEncoded.ok) throw new ValidationError('Invalid data', dataEncoded.error);

  const customer = { ...params, id: dataEncoded.value };

  await updateKey('customer', customer);

  return customer;
};

export const server$RetrieveSubscription = async (id: string) => {
  const subscriptions = await getKeyValue('subscriptions');

  if (!subscriptions) throw new ValidationError('Subscriptions not found', { cause: 'Subscriptions not found' });

  const subscription = subscriptions.find(sub => sub.id === id);

  if (!subscription) throw new ValidationError('Subscription not found', { cause: 'Subscription not found' });

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

export const server$CreateCustomer = async (params: CreateCustomerParams) => {
  const { email, name } = params;

  const dataEncoded = safeEncode(JSON.stringify({ email, name }));

  if (!dataEncoded.ok) throw new ValidationError('Invalid data', dataEncoded.error);

  const customer = { ...params, id: dataEncoded.value };

  await updateKey('customers', [...((await getKeyValue('customers')) || []), customer]);

  return customer;
};

export const server$HandleWebhook = async (payload: $ExtWebhookHandlerConfig) => {
  const { body } = payload;

  const parsedBody = safeParse(body, JSON.parse, 'Invalid webhook body');

  if (!parsedBody.ok) throw new ValidationError('Invalid webhook body', parsedBody.error);

  const { type, data } = parsedBody.value as { type: string; data: Record<string, any> };

  if (type === 'checkout.created') {
    const checkout = await server$RetrieveCheckout(data.id);

    return toPaykitEvent<Checkout>({ type: '$checkoutCreated', created: Date.now(), id: data.id, data: checkout });
  } else if (type == 'customer.created') {
    const customerId = safeEncode(data);

    const customerData = data as Pick<Customer, 'name' | 'email'>;

    if (!customerId.ok) throw new ValidationError('Invalid customer data', customerId.error);

    const retUpdate = { id: customerId.value, ...customerData };

    await updateKey('customers', [...((await getKeyValue('customers')) || []), retUpdate]);

    return toPaykitEvent<Customer>({ type: '$customerCreated', created: Date.now(), id: data.id, data: retUpdate });
  } else if (type == 'customer.updated') {
    const customerData = data as UpdateCustomerParams;

    const updatedCustomer = await server$UpdateCustomer(data.id, customerData);

    return toPaykitEvent<Customer>({ type: '$customerUpdated', created: Date.now(), id: data.id, data: updatedCustomer });
  } else if (type == 'customer.deleted') {
    const customers = await getKeyValue('customers');
    const filteredCustomers = customers?.filter(cust => cust.id !== data.id) || [];
    await updateKey('customers', filteredCustomers);

    return toPaykitEvent<null>({ type: '$customerDeleted', created: Date.now(), id: data.id, data: null });
  } else if (type == 'subscription.created') {
    const subscription = safeDecode<Subscription>(data.id);

    if (!subscription.ok) throw new ValidationError('Invalid subscription data', subscription.error);

    await updateKey('subscriptions', [...((await getKeyValue('subscriptions')) || []), subscription.value]);

    return toPaykitEvent<Subscription>({ type: '$subscriptionCreated', created: Date.now(), id: data.id, data: subscription.value });
  } else if (type == 'subscription.updated') {
    const subscription = safeDecode<Subscription>(data.id);

    if (!subscription.ok) throw new ValidationError('Invalid subscription data', subscription.error);

    const updatedSubscription = await server$UpdateSubscriptionHelper(subscription.value.id, { metadata: subscription.value.metadata || {} });

    return toPaykitEvent<Subscription>({ type: '$subscriptionUpdated', created: Date.now(), id: data.id, data: updatedSubscription });
  } else if (type == 'subscription.deleted') {
    await updateKey('subscriptions', (await getKeyValue('subscriptions'))?.filter(sub => sub.id !== data.id) || []);

    return toPaykitEvent<null>({ type: '$subscriptionCanceled', created: Date.now(), id: data.id, data: null });
  } else if (type == 'payment.succeeded') {
    const paymentId = safeEncode(data);

    if (!paymentId.ok) throw new ValidationError('Invalid payment data', paymentId.error);

    await updateKey('payments', [...((await getKeyValue('payments')) || []), paymentId.value]);

    return toPaykitEvent<{ id: string }>({ type: '$paymentReceived', created: Date.now(), id: paymentId.value, data: { id: paymentId.value } });
  }

  throw new ValidationError('Unknown webhook type', {});
};
