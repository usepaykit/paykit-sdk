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
- [PayKit Issues](https://github.com/devodii/paykit/issues)

## License

ISC
