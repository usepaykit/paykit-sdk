# @paykit-sdk/react

PayKit React is a toolkit designed to simplify payment processing in React applications. It provides hooks and components that work seamlessly with any PayKit provider (Stripe, Polar, Gumroad, etc.) to handle customers, subscriptions, and checkouts.

## Installation

```bash
npm install @paykit-sdk/react
```

## Quick Start

### 1. Setup Provider

```tsx
import { PaykitProvider } from '@paykit-sdk/react';
import { stripe } from '@paykit-sdk/stripe';

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
import * as React from 'react';
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

## Available Hooks

- `useCustomer()` - Manage customer data
- `useSubscription()` - Handle subscriptions
- `useCheckout()` - Process checkouts

## Providers

Works with any PayKit provider including Stripe, Polar, Gumroad, and more.

## Documentation

- [React Documentation](https://paykit.dev/docs/react)
- [PayKit Documentation](https://paykit.dev)
- [Production Examples](https://usepaykit.dev/docs/examples)

## TypeScript Support

Full TypeScript support included.

## License

MIT
