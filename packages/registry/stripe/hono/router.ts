import { endpoints, paykit } from '@/lib/paykit';
import type { EndpointArgs, EndpointHandler, EndpointPath } from '@paykit-sdk/core';
import { Hono } from 'hono';

export const paykitRouter = new Hono();

paykitRouter.post('/*', async c => {
  const path = c.req.path as EndpointPath;

  const handler = endpoints[path] as EndpointHandler<typeof path>;

  if (!handler) {
    return c.json({ message: 'Endpoint not found' }, 404);
  }

  const body = await c.req.json();
  const { args } = body as { args: EndpointArgs<typeof path> };

  try {
    const result = await handler(...args);
    return c.json({ result });
  } catch (error) {
    console.error('PayKit API Error:', error);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

// Webhook handler
paykitRouter.post('/webhooks', async c => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return c.json({ error: 'Webhook secret not configured' }, 500);
  }

  const webhook = paykit.webhooks
    .setup({ webhookSecret })
    .on('customer.created', async event => {
      console.log('Customer created:', event.data);
    })
    .on('subscription.created', async event => {
      console.log('Subscription created:', event.data);
    })
    .on('payment.created', async event => {
      console.log('Payment created:', event.data);
    })
    .on('refund.created', async event => {
      console.log('Refund created:', event.data);
    })
    .on('invoice.generated', async event => {
      console.log('Invoice generated:', event.data);
    });

  const body = await c.req.text();
  const headers = c.req.header();
  const url = c.req.raw.url;
  await webhook.handle({ body, headers, fullUrl: url });

  return c.json({ success: true });
});
