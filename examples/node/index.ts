import { PayKit, Webhook } from '@paykit-sdk/core';
import { stripe } from '@paykit-sdk/stripe';

const provider = stripe();
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
  mode: 'payment',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
  price_id: 'price_123',
  quantity: 1,
});
