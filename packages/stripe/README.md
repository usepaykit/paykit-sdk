# @paykit-sdk/stripe

Stripe provider for PayKit

## Quick Start

```typescript
import { PayKit } from '@paykit-sdk/core';
import { stripe, createStripe } from '@paykit-sdk/stripe';

// Method 1: Using environment variables
const provider = stripe(); // Ensure STRIPE_API_KEY environment variable is set

// Method 2: Direct configuration
const provider = createStripe({
  apiKey: process.env.STRIPE_API_KEY,
  apiVersion: '2024-12-18.acacia',
});

const paykit = new PayKit(provider);

// Create checkout
const checkout = await paykit.checkouts.create({
  customer_id: 'cus_123',
  item_id: 'price_123',
  session_type: 'one_time',
  metadata: { plan: 'pro' },
  provider_metadata: {
    ui_mode: 'hosted',
    success_url: 'https://your-app.com/success',
  },
});

// Handle webhooks
paykit.webhooks
  .setup({ webhookSecret: process.env.STRIPE_WEBHOOK_SECRET })
  .on('$checkoutCreated', async event => {
    console.log('Checkout created:', event.data);
  })
  .on('$invoicePaid', async event => {
    console.log('Payment received:', event.data);
  });
```

## Webhook Implementation

### Next.js API Route

```typescript
import { paykit } from '@/lib/paykit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Stripe webhook received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.STRIPE_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
      // Handle checkout creation
    })
    .on('$customerCreated', async event => {
      console.log('Customer created:', event.data);
      // Handle customer creation
    })
    .on('$customerUpdated', async event => {
      console.log('Customer updated:', event.data);
      // Handle customer updates
    })
    .on('$subscriptionCreated', async event => {
      console.log('Subscription created:', event.data);
      // Handle subscription creation
    })
    .on('$subscriptionUpdated', async event => {
      console.log('Subscription updated:', event.data);
      // Handle subscription updates
    })
    .on('$subscriptionCancelled', async event => {
      console.log('Subscription cancelled:', event.data);
      // Handle subscription cancellation
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
      // Handle successful payment
    });

  const headers = Object.fromEntries(request.headers.entries());
  const body = await request.text();
  await webhook.handle({ body, headers });

  return NextResponse.json({ success: true });
}
```

### Express.js Route

```typescript
import { paykit } from '@/lib/paykit';
import express from 'express';

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/api/webhooks/stripe', async (req, res) => {
  console.log('Stripe webhook received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.STRIPE_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$customerCreated', async event => {
      console.log('Customer created:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
    });

  const headers = req.headers;
  const body = req.body;
  await webhook.handle({ body, headers });

  res.json({ success: true });
});
```

### Vite.js

```typescript
import { paykit } from '@/lib/paykit';

export default defineEventHandler(async event => {
  console.log('Stripe webhook received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.STRIPE_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$customerCreated', async event => {
      console.log('Customer created:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
    });

  const headers = getHeaders(event);
  const body = await readBody(event);
  await webhook.handle({ body, headers });

  return { success: true };
});
```

## Subscription Management

```typescript
// Update subscription
await paykit.subscriptions.update('sub_123', {
  metadata: { plan: 'enterprise' },
});

// Cancel subscription
await paykit.subscriptions.cancel('sub_123');
```

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Support

- [Stripe Documentation](https://stripe.com/docs)

## License

GPL-3.0
