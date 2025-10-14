# @paykit-sdk/agentic

Agentic Commerce Protocol adapter for PayKit. Enables AI agents to handle checkout sessions with any PayKit provider.

## Installation

```bash
npm install @paykit-sdk/agentic @paykit-sdk/core
```

## Install a provider

```bash
npm install @paykit-sdk/stripe
```

Learn more about [Stripe provider](../../stripe/README.md) or other [available providers](../../README.md#providers).

## Usage

```typescript
import { PaykitAgenticAdapter } from '@paykit-sdk/agentic';
import { stripe } from '@paykit-sdk/stripe';

const provider = stripe();
const agenticAdapter = new PaykitAgenticAdapter(provider);

// Create agentic checkout session
const session = await agenticAdapter.createAgenticCheckoutSession({
  buyer: {
    email: 'customer@example.com',
    name: 'John Doe',
  },
  checkout: {
    session_type: 'one_time',
    item_id: 'price_123',
    quantity: 1,
  },
  fulfillment_address: {
    line1: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94102',
    country: 'US',
  },
});

// Retrieve session
const retrieved = await agenticAdapter.retrieveAgenticCheckoutSession(session.id);
```

## Methods

- `createAgenticCheckoutSession(params)` - Create checkout session
- `retrieveAgenticCheckoutSession(id)` - Retrieve session by ID
- `updateAgenticCheckoutSession(id, params)` - Update session (not implemented)
- `completeAgenticCheckoutSession(id, params)` - Complete session (not implemented)
- `cancelAgenticCheckoutSession(id)` - Cancel session (not implemented)
- `delegatePayment(params)` - Delegate payment processing (not implemented)

## Resources

- [Agentic Commerce Protocol](https://github.com/agentic-commerce)
- [PayKit Documentation](../../README.md)

## License

ISC
