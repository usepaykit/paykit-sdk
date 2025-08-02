# @paykit-sdk/polar

Polar provider for PayKit

## Quick Start

```typescript
import { PayKit } from '@paykit-sdk/core';
import { polar, createPolar } from '@paykit-sdk/polar';

// Method 1: Using environment variables
const provider = polar(); // Ensure POLAR_ACCESS_TOKEN environment variable is set

// Method 2: Direct configuration
const provider = createPolar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: 'sandbox', // or 'production'
  debug: true,
});

const paykit = new PayKit(provider);

// Create checkout
const checkout = await paykit.checkouts.create({
  item_id: 'product-id',
  metadata: { plan: 'pro' },
  provider_metadata: {
    successUrl: 'https://your-app.com/success',
  },
});

// Handle webhooks
paykit.webhooks
  .setup({ webhookSecret: process.env.POLAR_WEBHOOK_SECRET })
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
  console.log('Polar webhook received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.POLAR_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$customerCreated', async event => {
      console.log('Customer created:', event.data);
    })
    .on('$customerUpdated', async event => {
      console.log('Customer updated:', event.data);
    })
    .on('$customerDeleted', async event => {
      console.log('Customer deleted:', event.data);
    })
    .on('$subscriptionCreated', async event => {
      console.log('Subscription created:', event.data);
    })
    .on('$subscriptionUpdated', async event => {
      console.log('Subscription updated:', event.data);
    })
    .on('$subscriptionCancelled', async event => {
      console.log('Subscription cancelled:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
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

app.post('/api/webhooks/polar', async (req, res) => {
  console.log('Polar webhook received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.POLAR_WEBHOOK_SECRET! })
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

### Vite.js/Nuxt.js

```typescript
import { paykit } from '@/lib/paykit';

export default defineEventHandler(async event => {
  console.log('Polar webhook received');

  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.POLAR_WEBHOOK_SECRET! })
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

## Subscription Updates

Polar requires specific update types:

```typescript
// Change product
await paykit.subscriptions.update('sub_123', {
  metadata: { productId: 'new-product-id' },
});

// Cancel at period end
await paykit.subscriptions.update('sub_123', {
  metadata: { cancelAtPeriodEnd: 'true' },
});

// Cancel with reason
await paykit.subscriptions.update('sub_123', {
  metadata: {
    cancelAtPeriodEnd: 'true',
    customerCancellationReason: 'too_expensive',
  },
});
```

## Environment Variables

```bash
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_WEBHOOK_SECRET=your-webhook-secret
```

## Support

- [Polar Documentation](https://docs.polar.sh/)
- [PayKit Issues](https://github.com/devodii/paykit/issues)

## License

ISC
