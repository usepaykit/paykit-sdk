# @paykit-sdk/local

Local development provider for PayKit helps you test offline without no dependencies.

## Overview

The local provider creates a complete payment simulation environment on your machine. Your backend logic lives in a single configurable file, and the development server provides a hosted checkout experience at `http://localhost:3001`.

## Quick Setup

1. **Initialize the project:**

   ```bash
   npx @paykit-sdk/cli init
   ```

   This generates a `.paykit/config.json` file where you'll define your payment logic.

2. **Start the development server:**

   ```bash
   npx @paykit-sdk/cli dev
   ```

   The checkout interface will be available at `http://localhost:3001`.

## Configuration

Edit `.paykit/config.json` to define your payment flows:

```json
{
  "product": {
    "itemId": "it_YsojnrQDeFTuoKdVgtAqnbRolk-3nq",
    "name": "Paykit Pro Licensce",
    "description": "Go unlimited!",
    "price": "$25"
  },
  "customer": {
    "id": "cus_hS3kLFq0U3e1l1H8haxV7-LqlnIsn0",
    "email": "emmanuelodii80@gmail.com",
    "name": "Emmanuel Odii",
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
      "amount": "$25",
      "customer_id": "cus_hS3kLFq0U3e1l1H8haxV7-LqlnIsn0",
      "metadata": { "plan": "pro", "billing": "monthly" },
      "session_type": "recurring",
      "products": [{ "id": "it_YsojnrQDeFTuoKdVgtAqnbRolk-3nq", "quantity": 1 }],
      "currency": "USD",
      "id": "eyJhbW91bnQiOiIkMjUi19...",
      "payment_url": "http://localhost:3001/checkout?id=eyJhbW91bnQiOiIkMjUi19..."
    }
  ],
  "payments": ["eyJjdXN0b21lcl9pZCI6ImN1c19oUzNrTEZ.."]
}
```

## API Route Setup

### Next.js

```typescript
import { paykit } from '@/lib/paykit';
import { withNextJsWebhook } from '@paykit-sdk/local/plugins';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webhook = paykit.webhooks
    .setup({ webhookSecret: process.env.PAYKIT_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$customerCreated', async event => {
      console.log('Customer created:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
    });

  const result = await withNextJsWebhook(request.url.toString(), webhook);

  return NextResponse.json(result);
}
```

### Vite.js

```typescript
import { paykit } from '@/lib/paykit';
import { withViteWebhook } from '@paykit-sdk/local/plugins';

export default defineEventHandler(async event => {
  const webhook = paykit.webhooks
    .setup({ webhookSecret: import.meta.url.PAYKIT_WEBHOOK_SECRET! })
    .on('$checkoutCreated', async event => {
      console.log('Checkout created:', event.data);
    })
    .on('$invoicePaid', async event => {
      console.log('Payment received:', event.data);
    });

  const result = await withViteWebhook(event, webhook);

  return result;
});
```

## Provider Setup

```typescript
import { PayKit } from '@paykit-sdk/core';
import { createLocal } from '@paykit-sdk/local';

const provider = createLocal({
  apiUrl: 'http://localhost:3000/api/paykit',
  paymentUrl: 'http://localhost:3001',
});

const paykit = new PayKit(provider);

// Create checkout
const checkout = await paykit.checkouts.create({
  customer_id: 'test-customer',
  item_id: 'pro-plan',
  session_type: 'one_time',
  metadata: { plan: 'pro' },
});
```

## Development Workflow

1. Run `npx @paykit-sdk/cli init` to create your config
2. Edit `.paykit/config.json` with your products, customers, and subscriptions
3. Start the dev server with `npx @paykit-sdk/cli dev`
4. Implement your API route using the plugin helpers
5. Test payment flows through the hosted checkout interface

## Support

- [PayKit Documentation](https://usepaykit.dev)

## License

ISC
