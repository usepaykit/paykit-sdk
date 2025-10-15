# @paykit-sdk/stripe

Stripe provider for PayKit

## Quick Start

```typescript
import { createEndpointHandlers, PayKit } from '@paykit-sdk/core';
import { stripe, createStripe } from '@paykit-sdk/stripe';

// Method 1: Using environment variables
const provider = stripe(); // Ensure STRIPE_API_KEY environment variable is set

// Method 2: Direct configuration
const provider = createStripe({
  apiKey: process.env.STRIPE_API_KEY,
  apiVersion: '2024-12-18.acacia',
});

export const paykit = new PayKit(provider);
export const endpoints = createEndpointHandlers(paykit);
```

### Next.js Catch All API Route (/api/paykit/[...endpoint]/route.ts)

```typescript
import { paykit } from '@/lib/paykit';
import { EndpointPath } from '@paykit-sdk/core';

export async function POST(request: NextRequest, { params }: { params: { endpoint: string[] } }) {
  try {
    // Construct the endpoint path with full type safety
    const endpoint = ('/' + params.endpoint.join('/')) as EndpointPath;
    const handler = endpoints[endpoint];

    if (!handler) {
      return NextResponse.json({ message: 'Endpoint not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { args } = body;

    const result = await handler(...args);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('PayKit API Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
```

### Next.js Webhooks (/api/paykit/webhooks/route.ts)

```typescript
import { paykit } from '@/lib/paykit';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const webhook = paykit.webhooks
    .setup({ webhookSecret })
    .on('customer.created', async event => {
      console.log('Customer created:', event.data);
    });
    .on('subscription.created', async event => {
      console.log('Subscription created:', event.data);
    });
    .on('payment.created', async event => {
      console.log('Payment created:', event.data);
    });
    .on('refund.created', async event => {
     console.log('Refund created:', event.data);
    });
    .on('invoice.generated', async event => {
      console.log('Invoice generated:', event.data);
    });

  const body = await request.text();
  const headers = Object.fromEntries(request.headers.entries());
  const url = request.url
  await webhook.handle({ body, headers, fullUrl: url });

  // Return immediately, processing happens in background
  return NextResponse.json({ success: true });
}
```

### Express.js with Webhook Handler

```typescript
import { paykit, endpoints } from '@/lib/paykit';
import { createEndpointHandlers, EndpointPath } from '@paykit-sdk/core';
import express from 'express';

const app = express();

// IMPORTANT: Webhook route must come BEFORE express.json() middleware
// This ensures we get the raw body for signature verification
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
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

    const body = req.body; // Raw buffer from express.raw()
    const headers = req.headers;
    const url = request.url;
    await webhook.handle({ body, headers, fullUrl: url });

    // Return immediately, processing happens in background
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Webhook processing failed',
    });
  }
});

// Regular API routes use JSON middleware
app.use(express.json());

app.post('/api/paykit/*', async (req, res) => {
  try {
    const endpoint = req.path.replace('/api/paykit', '') as EndpointPath;
    const handler = endpoints[endpoint];

    if (!handler) {
      return res.status(404).json({ message: 'Endpoint not found' });
    }

    const { args } = req.body;
    const result = await handler(...args);

    res.json({ result });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
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

ISC
