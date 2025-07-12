import { PayKit } from '@paykit-sdk/core';
import { polar } from '@paykit-sdk/polar';

const provider = polar();
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

const webhook = paykit.webhooks.setup({ webhookSecret: '123' }).on('$customerCreated', async event => {
  console.log({ event });
});

async function main() {
  await webhook.handle({ body: '123', headers: { 'x-webhook-secret': '123' } });
}

main();
