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
const paykit = new PayKit(createStripe({ apiKey: process.env.STRIPE_API_KEY }));

// Create a checkout session
const checkout = await paykit.checkouts.create({
  customer_id: 'cus_1234',
  metadata: { plan: 'pro' },
  session_type: 'recurring',
  item_id: 'pri_12345',
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

- [`@paykit-sdk/stripe`](../stripe) - Stripe integration
- [`@paykit-sdk/polar`](../polar) - Polar integration
- [`@paykit-sdk/local`](../local) - Local development
- [Custom providers](../custom-provider) - Build your own
