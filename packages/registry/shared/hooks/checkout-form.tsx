'use client';

import * as React from 'react';
import { useCheckout } from '@paykit-sdk/react';

export const CheckoutForm = () => {
  const { create } = useCheckout();
  const [checkoutUrl, setCheckoutUrl] = React.useState<string | null>(null);

  const handleCreateCheckout = async () => {
    const [data, error] = await create.run({
      session_type: 'one_time',
      item_id: 'price_123',
      quantity: 1,
      customer: 'cus_z123', // or { email: 'odii@gmail.com' }
      metadata: { source: 'web_app' },
      cancel_url: 'http://localhost:3000/dashboard',
      success_url: 'http://localhost:3000/success',
    });

    if (error) {
      console.error('Checkout creation failed:', error);
      return;
    }

    setCheckoutUrl(data.payment_url);
  };

  return (
    <div className="bg-background flex flex-col gap-4">
      <h2 className="text-foreground text-xl">Proceed to buy</h2>

      <button
        disabled={create.loading}
        onClick={handleCreateCheckout}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2"
      >
        {create.loading ? 'Creating...' : 'Create $29.99 Checkout'}
      </button>

      {checkoutUrl && (
        <div>
          <p>Checkout created!</p>
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
            Go to checkout →
          </a>
        </div>
      )}
    </div>
  );
};
