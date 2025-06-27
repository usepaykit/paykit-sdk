import { PayKit, Webhook } from '@paykit-sdk/core';
import { stripe } from '@paykit-sdk/stripe';

const provider = stripe();
const paykit = new PayKit(provider);

const customer = await paykit.customers.create({ email: 'test@test.com' });

const checkout = await paykit.checkouts.create({
  customer_id: customer.id,
  metadata: { order_id: '123' },
  session_type: 'one_time',
  item_id: 'price_123',
});

console.log({ checkout });

const updatedSubscription = await paykit.subscriptions.update('sub_123', { metadata: { order_id: '123' } });

console.log({ updatedSubscription });

const canceledSubscription = await paykit.subscriptions.cancel('sub_123');

console.log({ canceledSubscription });

const webhook = new Webhook(
  {
    provider,
    webhookSecret: 'whsec_123',
    onCustomerCreated: async event => console.log({ event }),
    onSubscriptionCreated: async subscription => console.log({ subscription }),
  },
  { body: '123', headers: { 'x-stripe-signature': '123' } },
);

console.log({ webhook });
