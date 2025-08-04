# @paykit-sdk/local

Local provider for PayKit development and testing.

## Quick Start

Install the Local provider:

<br />

```bash
npm install @paykit-sdk/local
```

## Setup

### Method 1: Environment Variables

```typescript
// lib/paykit.ts
import { PayKit } from '@paykit-sdk/core';
import { local } from '@paykit-sdk/local';

const provider = local(); // Ensure PAYKIT_API_URL, PAYKIT_PAYMENT_URL environment variables are set

const paykit = new PayKit(provider);

export { paykit };
```

### Method 2: Direct Configuration

<br />

```typescript
// lib/paykit.ts
import { PayKit } from '@paykit-sdk/core';
import { createLocal } from '@paykit-sdk/local';

const provider = createLocal({
  webhookUrl: 'http://localhost:3000/api/paykit',
  paymentUrl: 'http://localhost:3001',
});

const paykit = new PayKit(provider);

export { paykit };
```

```typescript
import { paykit } from '@/lib/paykit';

// Create checkout
const checkout = await paykit.checkouts.create({
  customer_id: 'cus_123',
  item_id: 'it_456',
  session_type: 'one_time',
  metadata: { plan: 'pro' },
});

// Handle webhooks
paykit.webhooks
  .setup({ webhookSecret: 'local' })
  .on('$checkoutCreated', async event => {
    console.log('Checkout created:', event.data);
  })
  .on('$invoicePaid', async event => {
    console.log('Payment received:', event.data);
  });
```

## Configuration

The local provider uses a `.paykit/config.json` file to store data. Here's the minimal boilerplate configuration:

```json
{
  "product": {
    "itemId": "it_YsojnrQDeFTuoKdVgtAqnbRolk-3nq",
    "name": "Paykit Pro License",
    "description": "Go unlimited!",
    "price": "$25"
  },
  "customer": {
    "id": "cus_hS3kLFq0U3e1l1H8haxV7-LqlnIsn0",
    "email": "john@doe.com",
    "name": "Emmanuel Odii",
    "metadata": {}
  },
  "checkouts": [],
  "subscriptions": [],
  "invoices": []
}
```

## Example: After Checkout Completion

After a checkout is completed, your config will look like this:

```json
{
  "product": {
    "itemId": "it_YsojnrQDeFTuoKdVgtAqnbRolk-3nq",
    "name": "Paykit Pro License",
    "description": "Go unlimited!",
    "price": "$25"
  },
  "customer": {
    "id": "cus_hS3kLFq0U3e1l1H8haxV7-LqlnIsn0",
    "email": "john@doe.com",
    "name": "John Doe",
    "metadata": {}
  },
  "subscriptions": [
    {
      "id": "sub_WEqpOMtKCIJlR4a-elBZEHnSfFq0yu",
      "customer_id": "cus_hS3kLFq0U3e1l1H8haxV7-LqlnIsn0",
      "status": "active",
      "current_period_start": "2025-08-01T22:51:23.651Z",
      "current_period_end": "2025-08-31T22:51:23.651Z",
      "metadata": { "plan": "pro", "billing": "monthly", "source": "cli-app" }
    }
  ],
  "checkouts": [
    {
      "amount": 25,
      "customer_id": "cus_hS3kLFq0U3e1l1H8haxV7-LqlnIsn0",
      "metadata": { "plan": "pro", "billing": "monthly" },
      "session_type": "recurring",
      "products": [{ "id": "it_YsojnrQDeFTuoKdVgtAqnbRolk-3nq", "quantity": 1 }],
      "currency": "USD",
      "id": "eyJhbW91bnQiOiIkMjUi19...",
      "payment_url": "http://localhost:3001/checkout?id=eyJhbW91bnQiOiIkMjUi19..."
    }
  ],
  "invoices": [
    {
      "id": "inv_uwheiuy8yhchuwehiugcuwewew2",
      "amount": 25,
      "currency": "USD",
      "metadata": {},
      "customer_id": "cus_hS3kLFq0U3e1l1H8haxV7"
    }
  ]
}
```

## Webhook Implementation

### Next.js API Route

```typescript
import { paykit } from '@/lib/paykit';
import { withLocalWebhook } from '@paykit-sdk/local/plugins';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webhook = paykit.webhooks
    .setup({ webhookSecret: 'local' })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$customerCreated', async event => {
      console.log('Customer created:', event.data);
    })
    .on('$subscriptionCreated', async event => {
      console.log('Subscription created:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
    });

  const result = await withLocalWebhook(request.url.toString(), webhook);

  return NextResponse.json(result);
}
```

### Express.js Route

```typescript
import { paykit } from '@/lib/paykit';
import { withLocalWebhook } from '@paykit-sdk/local/plugins';
import express from 'express';

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/api/paykit', async (req, res) => {
  const webhook = paykit.webhooks
    .setup({ webhookSecret: 'local' })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
    });

  const result = await withLocalWebhook(req.url, webhook);

  return result;
});
```

### Vite.js

```typescript
import { paykit } from '@/lib/paykit';
import { withLocalWebhook } from '@paykit-sdk/local/plugins';

export default defineEventHandler(async event => {
  const url = event.url;

  const webhook = paykit.webhooks
    .setup({ webhookSecret: 'local' })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
    });

  const result = await withLocalWebhook(url, webhook);

  return result;
});
```

## Environment Variables

```bash
PAYKIT_API_URL=http://localhost:3000/api/paykit
PAYKIT_PAYMENT_URL=http://localhost:3001
```

## Support

- [PayKit Local Provider Documentation](https://usepaykit.dev/docs/providers/local)

## License

ISC
