# @paykit-sdk/react

React hooks and components for PayKit SDK - Universal payment processing with Stripe, Polar, and more.

## Installation

```bash
npm install @paykit-sdk/react
```

## Quick Start

### 1. Setup Provider

```tsx
import { PaykitProvider } from '@paykit-sdk/react';
import { stripe } from '@paykit-sdk/stripe';

// or import { local } from '@paykit-sdk/local';
// or import { polar } from '@paykit-sdk/polar';

const provider = stripe();

function App() {
  return (
    <PaykitProvider provider={provider}>
      <YourApp />
    </PaykitProvider>
  );
}
```

### 2. Use Hooks

```tsx
import { useCustomer, useSubscription, useCheckout } from '@paykit-sdk/react';

function CustomerDashboard() {
  const { retrieve, create, update } = useCustomer();

  React.useEffect(() => {
    retrieve.run(customerId);
  }, [customerId]);

  if (retrieve.loading) return <Spinner />;
  if (retrieve.error) return <Error error={retrieve.error} />;

  return <CustomerView customer={retrieve.data} />;
}
```

## Hooks API

### `useCustomer(options)`

```tsx
const { customer, create, update } = useCustomer({ customerId: 'cus_123' });
```

**Returns:**

- `customer` - Customer data
- `isLoading` - Loading state
- `error` - Error state
- `create` - Create customer mutation
- `update` - Update customer mutation

### `useSubscription(subscriptionId)`

```tsx
const { subscription, update, cancel } = useSubscription('sub_123');
```

**Returns:**

- `subscription` - Subscription data
- `isLoading` - Loading state
- `error` - Error state
- `update` - Update subscription mutation
- `cancel` - Cancel subscription mutation

### `useCheckout(checkoutId?)`

```tsx
const { checkout, create } = useCheckout();
```

**Returns:**

- `checkout` - Checkout data (if ID provided)
- `isLoading` - Loading state
- `error` - Error state
- `create` - Create checkout mutation

## Providers

Works with any PayKit provider:

```tsx
// Stripe
import { stripe } from '@paykit-sdk/stripe';
const provider = stripe();

// Local (for development)
import { local } from '@paykit-sdk/local';
const provider = local();

// Polar
import { polar } from '@paykit-sdk/polar';
const provider = polar();
```

## TypeScript Support

Full TypeScript support included with proper type definitions.

## License

MIT
