'use client';

import * as React from 'react';
import { useCustomer, useSubscription, useRefund } from '@paykit-sdk/react';

export const CustomerManager = () => {
  const { create: createCustomer } = useCustomer();
  const { create: createSubscription } = useSubscription();
  const { cancel: cancelSubscription } = useSubscription();
  const { create: createRefund } = useRefund();

  const [customerId, setCustomerId] = React.useState<string>();
  const [subscriptionId, setSubscriptionId] = React.useState<string>();
  const [paymentId, setPaymentId] = React.useState<string>();

  const handleCreateCustomer = async () => {
    const [data, error] = await createCustomer.run({
      email: 'customer@example.com',
      phone: '+1234567890',
      name: 'John Doe',
      metadata: { isPowerUser: 'true' },
    });

    if (error) {
      console.error('Failed to create customer:', error);
      return;
    }

    setCustomerId(data.id);
  };

  // Create subscription
  const handleCreateSubscription = async () => {
    if (!customerId) return;

    const [data, error] = await createSubscription.run({
      customer: customerId,
      item_id: 'price_...',
      amount: 2999,
      currency: 'USD',
      billing_interval: 'month',
      metadata: { isPowerUser: 'true' },
    });

    if (error) {
      console.error('Failed to create subscription:', error);
      return;
    }

    setSubscriptionId(data.id);
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!subscriptionId) return;

    const [, error] = await cancelSubscription.run(subscriptionId);

    if (error) {
      console.error('Failed to cancel subscription:', error);
      return;
    }

    console.log('Subscription cancelled');
  };

  // Create refund
  const handleCreateRefund = async () => {
    if (!paymentId) return;

    const [data, error] = await createRefund.run({
      payment_id: paymentId,
      amount: 1000, // $10.00
      reason: 'customer_request',
      metadata: null,
    });

    if (error) {
      console.error('Failed to create refund:', error);
      return;
    }

    console.log(`Refund created: ${data.id}`);
  };

  return (
    <div className="bg-background flex flex-col gap-4 rounded-lg p-4">
      <h2 className="text-foreground text-2xl font-bold">Customer Manager</h2>

      {/* Customer Section */}
      <section className="flex flex-col gap-2">
        <h3 className="text-foreground text-lg font-medium">Customer</h3>
        <button onClick={handleCreateCustomer} disabled={createCustomer.loading}>
          {createCustomer.loading ? 'Creating...' : 'Create Customer'}
        </button>
        {customerId && <p>Customer ID: {customerId}</p>}
      </section>

      {/* Subscription Section */}
      <section className="flex flex-col gap-2">
        <h3 className="text-foreground text-lg font-medium">Subscription</h3>
        <button
          onClick={handleCreateSubscription}
          disabled={!customerId || createSubscription.loading}
        >
          {createSubscription.loading ? 'Creating...' : 'Create Subscription'}
        </button>
        <button
          onClick={handleCancelSubscription}
          disabled={!subscriptionId || cancelSubscription.loading}
        >
          {cancelSubscription.loading ? 'Cancelling...' : 'Cancel Subscription'}
        </button>
        {subscriptionId && <p>Subscription ID: {subscriptionId}</p>}
      </section>

      {/* Refund Section */}
      <section className="flex flex-col gap-2">
        <h3 className="text-foreground text-lg font-medium">Refund</h3>
        <input
          type="text"
          placeholder="Enter Payment ID"
          value={paymentId}
          onChange={e => setPaymentId((e.target as HTMLInputElement).value as string)}
          className="bg-background border-input rounded-md border p-2"
        />

        <button
          onClick={handleCreateRefund}
          disabled={!paymentId || createRefund.loading}
        >
          {createRefund.loading ? 'Processing...' : 'Create $10 Refund'}
        </button>
      </section>
    </div>
  );
};
