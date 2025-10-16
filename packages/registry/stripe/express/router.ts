import { endpoints, paykit } from '@/lib/paykit';
import type { EndpointArgs, EndpointHandler, EndpointPath } from '@paykit-sdk/core';
import { Router, type Request, type Response } from 'express';

export const paykitRouter = Router();

// Catch-all for PayKit API endpoints
paykitRouter.post('/*', async (req: Request, res: Response) => {
  const path = req.path as EndpointPath;
  const handler = endpoints[path] as EndpointHandler<typeof path>;

  if (!handler) {
    return res.status(404).json({ message: 'Endpoint not found' });
  }

  const { args } = req.body as { args: EndpointArgs<typeof path> };

  try {
    const result = await handler(...args);
    return res.json({ result });
  } catch (error) {
    console.error('PayKit API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Webhook handler
paykitRouter.post('/webhooks', async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
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

  // Express stores raw body in req.body when using express.raw()
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const headers = req.headers as Record<string, string | string[]>;
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  await webhook.handle({ body, headers, fullUrl });

  return res.json({ success: true });
});

/**
 * MAIN APP ROUTER INTEGRATION:
 * import express from 'express';
 * import { paykitRouter } from './router';
 *
 * const app = express();
 *
 * ⚠️ IMPORTANT: Middleware setup
 * app.use(express.json());
 * app.use('/paykit/webhooks',express.raw({ type: 'application/json' }));
 *
 * // Your existing routes
 * app.get('/', (req, res) => res.send('Hello World'));
 *
 * // PayKit routes
 * app.use('/paykit', paykitRouter);
 *
 * app.listen(3000, () => {
 *   console.log('Server running on port 3000');
 * });
 */
