# PayKit Core

The unified Payment SDK for TypeScript developers.

## Installation

```bash
npm install @paykit-sdk/core
```

## Quick Start

```typescript
import { PayKit } from '@paykit-sdk/core';
import { createStripe } from '@paykit-sdk/stripe';

// Initialize with a provider
const provider = createStripe({ apiKey: process.env.STRIPE_API_KEY });
const paykit = new PayKit(provider);

// Create a checkout session
const checkout = await paykit.checkouts.create({
  customer_id: 'cus_1234',
  metadata: { plan: 'pro' },
  session_type: 'recurring',
  item_id: 'pri_12345',
  quantity: 1,
  cancel_url: 'http://localhost:3000',
  success_url: 'http://localhost:3000',
  provider_metadata: {},
});
```

## API

PayKit provides a unified interface for payment operations:

- `Checkouts` - Create and retrieve checkout sessions
- `Customers` - Manage customer data
- `Subscriptions` - Handle subscription lifecycle
- `Webhooks` - Process payment events

## Providers

PayKit works with multiple payment providers:

- [`@paykit-sdk/stripe`](https://github.com/usepaykit/paykit-sdk/tree/main/packages/stripe) - Stripe integration
- [`@paykit-sdk/polar`](https://github.com/usepaykit/paykit-sdk/tree/main/packages/polar) - Polar integration
- [`@paykit-sdk/paypal`](https://github.com/usepaykit/paykit-sdk/tree/main/packages/paypal) - PayPal integration
- [Custom providers](https://github.com/usepaykit/paykit-sdk/tree/main/packages/custom-provider) - Build your own
