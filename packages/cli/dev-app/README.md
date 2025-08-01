# PayKit CLI Dev App

This is a development application for testing PayKit functionality.

## Redirect After Checkout

After a successful payment, users are automatically redirected back to where they came from using the browser's referrer header. This provides a seamless user experience without requiring any additional configuration.

### How It Works

1. **Automatic Referrer Detection**: When a user visits the checkout page, the application automatically reads the `referer` header from the browser
2. **Seamless Redirect**: After successful payment completion, users are automatically redirected back to their original location
3. **Fallback Behavior**: If no referrer is available, users stay on the checkout page and see the success message

### Example Implementation

```typescript
import { useCheckout } from '@paykit-sdk/react';

function PaymentButton() {
  const { create } = useCheckout();
  const router = useRouter();

  const handlePayment = async () => {
    const { data, error } = await create.run({
      customer_id: customerId,
      item_id: itemId,
      session_type: 'one_time',
      metadata: { source: 'payment-button' },
      provider_metadata: {
        currency: 'USD',
        amount: 2500
      },
    });

    if (error) throw new Error(error.message);

    // User will be automatically redirected back after payment
    router.push(data.payment_url);
  };

  return (
    <button onClick={handlePayment}>
      Pay $25.00
    </button>
  );
}
```
