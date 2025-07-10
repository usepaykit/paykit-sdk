import * as React from 'react';
import { polar } from '@paykit-sdk/polar';
import { useCheckout, PaykitProvider } from '@paykit-sdk/react';

export const Billing = () => {
  const { create } = useCheckout();

  const handleCreateCheckout = async () => {
    return await create.run({
      customer_id: '123',
      metadata: { order_id: '123' },
      item_id: 'pr_123',
      session_type: 'one_time',
    });
  };

  return (
    <button
      onClick={async () => {
        const { data, error } = await handleCreateCheckout();

        if (error) return alert(error.message);

        window.location.href = data.payment_url || '';
      }}
    >
      Buy now
    </button>
  );
};

export const App = () => {
  return (
    <PaykitProvider provider={polar()}>
      <Billing />
    </PaykitProvider>
  );
};
