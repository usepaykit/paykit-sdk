# PayKit

The Payment Toolkit for TypeScript developers.

PayKit is a unified SDK that simplifies payment processing across different providers with a consistent API.

## Installation

```bash
npm install @paykit-sdk/core
```

## Quick Start

```typescript
import { PayKit, Webhook } from '@paykit-sdk/core';
import { stripe } from '@paykit-sdk/stripe';

// Initialize with your preferred provider
const provider = stripe();
const paykit = new PayKit(provider);

// Create customers
const customer = await paykit.customers.create({
  email: 'customer@example.com',
});

// Create checkout sessions
const checkout = await paykit.checkouts.create({
  customer_id: customer.id,
  metadata: { credits: '20' },
  mode: 'payment',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
  price_id: 'price_123',
  quantity: 1,
});

// Handle webhooks
const webhook = new Webhook({
  provider,
  webhookSecret: process.env.WEBHOOK_SECRET,
  onCheckoutCreated: async event => {
    console.log('Checkout created:', event);
  },
});
```

## Features

- **🔄 Provider Agnostic**: Switch between payment providers without changing your code
- **📦 TypeScript First**: Full type safety and IntelliSense support
- **🎯 Simple API**: Consistent interface across all payment providers
- **🔐 Webhook Support**: Built-in webhook handling with type-safe event handlers
- **⚡ Modern**: Built with modern TypeScript and ES modules

## Supported Providers

- Stripe
- Polar
- More providers coming soon...

## API Reference

### Customers

- `customers.create()` - Create a new customer
- `customers.update()` - Update customer details
- `customers.retrieve()` - Get customer information

### Checkouts

- `checkouts.create()` - Create a checkout session
- `checkouts.retrieve()` - Get checkout session details

### Subscriptions

- `subscriptions.update()` - Update subscription
- `subscriptions.cancel()` - Cancel subscription

## Webhooks

Handle payment events with type-safe webhook handlers:

```typescript
const webhook = new Webhook({
  provider,
  webhookSecret: 'your-webhook-secret',
  onCheckoutCreated: async event => {
    // Handle successful checkout
  },
});
```

---

**Maintained by [Emmanuel Odii](https://github.com/emmanuelodii)**
