import { PayKit, Webhook } from '@paykit-sdk/core';
import { polar } from '@paykit-sdk/polar';
import { stripe } from '@paykit-sdk/stripe';

const provider = polar();
const paykit = new PayKit(provider);

const customer = await paykit.customers.create({ email: 'test@test.com' });

export const webhook = new Webhook({
  provider,
  webhookSecret: 'whsec_123',
  onCustomerCreated: async event => console.log({ event }),
});

export const checkout = await paykit.checkouts.create({
  customer_id: customer.id,
  metadata: { order_id: '123' },
  session_type: 'one_time',
  item_id: 'price_123',
});
