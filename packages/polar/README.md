# @paykit-sdk/polar

Polar provider for PayKit

## Quick Start

```typescript
import { PayKit } from '@paykit-sdk/core';
import { polar, createPolar } from '@paykit-sdk/polar';

// Method 1: Using environment variables
const provider = polar(); // Uses POLAR_ACCESS_TOKEN from env

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
  .on('$paymentReceived', async event => {
    console.log('Payment received:', event.data);
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
