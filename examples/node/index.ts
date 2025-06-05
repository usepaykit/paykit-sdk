import { PayKit } from '../../packages/paykit/src';
import { stripe } from '../../packages/stripe/src';

const paykit = new PayKit(stripe());

const checkout = await paykit.checkouts.create({
  customer_id: 'cus_123',
  metadata: { order_id: '123' },
  mode: 'payment',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
  price_id: 'price_123',
  quantity: 1,
});
