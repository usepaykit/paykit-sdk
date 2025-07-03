import {
  PayKitProvider,
  CreateCheckoutParams,
  CreateCustomerParams,
  UpdateSubscriptionParams,
  Subscription,
  WebhookConfig,
  UpdateCustomerParams,
  safeEncode,
  ValidationError,
  safeDecode,
  PaykitProviderOptions,
  toPaykitEvent,
  Checkout,
  safeParse,
  Customer,
} from '@paykit-sdk/core';
import { getKeyValue, updateKey } from './tools';

export interface LocalConfig extends PaykitProviderOptions {}
export class LocalProvider implements PayKitProvider {
  #paymentUrl = process.env.PAYKIT_PAYMENT_URL;
  #baseUrl = process.env.PAYKIT_BASE_URL!;

  constructor(config: LocalConfig) {}

  private updateSubscriptionHelper = async (id: string, updates: Partial<Subscription>) => {
    const subscriptions = getKeyValue('subscriptions');

    if (!subscriptions) throw new ValidationError('Subscriptions not found', { provider: 'local' });

    const subscriptionIndex = subscriptions.findIndex(sub => sub.id === id) ?? -1;

    if (subscriptionIndex === -1) throw new ValidationError('Subscription not found', { provider: 'local' });

    const updatedSubscriptions = [...subscriptions];
    updatedSubscriptions[subscriptionIndex] = { ...updatedSubscriptions[subscriptionIndex], ...updates };

    updateKey('subscriptions', updatedSubscriptions);

    return updatedSubscriptions[subscriptionIndex];
  };

  createCheckout = async (params: CreateCheckoutParams) => {
    const { customer_id, session_type, item_id, metadata } = params;

    const dataEncoded = safeEncode(JSON.stringify({ item_id, customer_id, session_type, metadata }));

    if (!dataEncoded.ok) throw new ValidationError('Invalid data', dataEncoded.error);

    const redirectUrl = `${this.#paymentUrl}?${new URLSearchParams({ flowId: dataEncoded.value }).toString()}`;

    return {
      id: 'id',
      amount: 100,
      currency: 'USD',
      customer_id: 'customer_id',
      metadata: {},
      payment_url: redirectUrl,
      session_type: session_type,
      products: [],
    };
  };

  retrieveCheckout = async (id: string) => {
    const dataDecoded = safeDecode<Pick<CreateCheckoutParams, 'item_id' | 'customer_id' | 'session_type' | 'metadata'>>(id);

    if (!dataDecoded.ok) throw new ValidationError('Invalid data', dataDecoded.error);

    const paymentUrl = `${this.#paymentUrl}?${new URLSearchParams({ flowId: id }).toString()}`;

    const { customer_id, session_type, metadata } = dataDecoded.value;

    return {
      id: 'id',
      customer_id,
      metadata,
      payment_url: paymentUrl,
      amount: 100,
      currency: 'USD',
      session_type,
      products: [],
    };
  };

  createCustomer = async (params: CreateCustomerParams) => {
    const dataEncoded = safeEncode(JSON.stringify(params));

    if (!dataEncoded.ok) throw new ValidationError('Invalid data', dataEncoded.error);

    const customer = { ...params, id: dataEncoded.value };

    updateKey('customer', customer);

    return customer;
  };

  updateCustomer = async (id: string, params: UpdateCustomerParams) => {
    const dataEncoded = safeEncode(JSON.stringify(params));

    if (!dataEncoded.ok) throw new ValidationError('Invalid data', dataEncoded.error);

    const customer = { ...params, id };

    updateKey('customer', customer);

    return customer;
  };

  retrieveCustomer = async (id: string) => {
    const customer = getKeyValue('customer');

    if (!customer) return null;

    return { ...customer, id };
  };

  updateSubscription = async (id: string, params: UpdateSubscriptionParams) => {
    return this.updateSubscriptionHelper(id, params);
  };

  cancelSubscription = async (id: string) => {
    return this.updateSubscriptionHelper(id, { status: 'canceled' });
  };

  retrieveSubscription = async (id: string) => {
    const subscriptions = getKeyValue('subscriptions');

    if (!subscriptions) throw new ValidationError('Subscriptions not found', { provider: 'local' });

    const subscription = subscriptions.find(sub => sub.id === id);

    if (!subscription) throw new ValidationError('Subscription not found', { provider: 'local' });

    return subscription;
  };

  handleWebhook = async (payload: WebhookConfig) => {
    const { body } = payload;

    const parsedBody = safeParse(body, JSON.parse, 'Invalid webhook body');

    if (!parsedBody.ok) throw new ValidationError('Invalid webhook body', parsedBody.error);

    const { type, data } = parsedBody.value as { type: string; data: Record<string, any> };

    if (type === 'checkout.created') {
      const checkout = await this.retrieveCheckout(data.id);

      updateKey('checkouts', [...(getKeyValue('checkouts') || []), checkout]);

      return toPaykitEvent<Checkout>({ type: '$checkoutCreated', created: Date.now(), id: data.id, data: checkout });
    } else if (type == 'customer.created') {
      const customer = safeEncode(data);

      if (!customer.ok) throw new ValidationError('Invalid customer data', customer.error);

      updateKey('customer', { id: customer.value, name: data.name, email: data.email });

      return toPaykitEvent<Customer>({
        type: '$customerCreated',
        created: Date.now(),
        id: data.id,
        data: { id: customer.value, name: data.name, email: data.email },
      });
    } else if (type == 'customer.updated') {
      const customer = safeEncode(data);

      if (!customer.ok) throw new ValidationError('Invalid customer data', customer.error);

      updateKey('customer', { id: customer.value, name: data.name, email: data.email });

      return toPaykitEvent<Customer>({
        type: '$customerUpdated',
        created: Date.now(),
        id: data.id,
        data: { id: customer.value, name: data.name, email: data.email },
      });
    } else if (type == 'customer.deleted') {
      updateKey('customer', {});
      return toPaykitEvent<null>({ type: '$customerDeleted', created: Date.now(), id: data.id, data: null });
    } else if (type == 'subscription.created') {
      const subscription = safeDecode<Subscription>(data.id);

      if (!subscription.ok) throw new ValidationError('Invalid subscription data', subscription.error);

      updateKey('subscriptions', [...(getKeyValue('subscriptions') || []), subscription.value]);

      return toPaykitEvent<Subscription>({
        type: '$subscriptionCreated',
        created: Date.now(),
        id: data.id,
        data: subscription.value,
      });
    } else if (type == 'subscription.updated') {
      const subscription = safeDecode<Subscription>(data.id);

      if (!subscription.ok) throw new ValidationError('Invalid subscription data', subscription.error);

      updateKey('subscriptions', [...(getKeyValue('subscriptions') || []), subscription.value]);
      return toPaykitEvent<Subscription>({
        type: '$subscriptionUpdated',
        created: Date.now(),
        id: data.id,
        data: subscription.value,
      });
    } else if (type == 'subscription.deleted') {
      updateKey('subscriptions', getKeyValue('subscriptions')?.filter(sub => sub.id !== data.id) || []);

      return toPaykitEvent<null>({ type: '$subscriptionCanceled', created: Date.now(), id: data.id, data: null });
    } else if (type == 'payment.succeeded') {
      const paymentId = data.id;

      updateKey('payments', [...(getKeyValue('payments') || []), paymentId]);

      return toPaykitEvent<{ id: string }>({ type: '$paymentReceived', created: Date.now(), id: paymentId, data: { id: paymentId } });
    }
    throw new ValidationError('Unknown webhook type', { provider: 'local' });
  };
}
