'use client';

import * as React from 'react';
import { delay, type Subscription, truncate } from '@paykit-sdk/core';
import { useSubscription } from '@paykit-sdk/react';
import { Dialog, Button, Card, Badge, Toast } from '@paykit-sdk/ui';
import { format } from 'date-fns';
import { Calendar, CreditCard, User, CheckCircle } from 'lucide-react';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const subscriptionId = 'sub_WEqpOMtKCIJlR4a-elBZEHnSfFq0yu';

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const { cancel, retrieve, update } = useSubscription();

  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const [subscription, error] = await retrieve.run(subscriptionId);
      if (subscription) return setSubscription(subscription);
      Toast.error({ title: 'Error', description: error?.message });
    })();
  }, []);

  const hasActiveSubscription = subscription?.status === 'active';

  const handleManageSubscription = async () => {
    try {
      setLoading(true);

      await delay(1000);

      if (hasActiveSubscription) {
        const [, error] = await cancel.run(subscription.id);

        if (error) {
          Toast.error({ title: 'Error', description: error.message });
          return;
        }

        Toast.success({ title: 'Success', description: 'Subscription canceled successfully' });
      } else {
        if (!subscription) return;

        await update.run(subscription.id, { metadata: { status: 'active' } });
        Toast.success({ title: 'Success', description: 'Subscription resumed successfully' });
      }
    } catch (error) {
      Toast.error({ title: 'Error', description: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary text-primary-foreground';
      case 'canceled':
        return 'bg-destructive text-destructive-foreground';
      case 'past_due':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-[500px]">
        <Dialog.Header>
          <Dialog.Title className="font-outfit flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Details
          </Dialog.Title>
        </Dialog.Header>
        {subscription ? (
          <div className="space-y-6">
            <Card.Root className="border-2">
              <Card.Header className="pb-3">
                <div className="flex items-center justify-between">
                  <Card.Title className="font-outfit text-lg">Current Plan</Card.Title>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                </div>
                <Card.Description>Subscription ID: {subscription.id}</Card.Description>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      Customer ID
                    </div>
                    <p className="font-mono text-sm">{truncate(subscription.customer_id, 10, '...')}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Plan Type
                    </div>
                    <p className="font-semibold capitalize">{subscription.metadata?.plan || 'Free'} Plan</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Billing Period
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{format(subscription.current_period_start, 'MMM dd, yyyy')}</span>
                    <span className="text-muted-foreground text-sm">to</span>
                    <span className="text-sm">{format(subscription.current_period_end, 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                {subscription.metadata && Object.keys(subscription.metadata).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-muted-foreground text-sm font-medium">Additional Details</h4>
                    <div className="space-y-1">
                      {Object.entries(subscription.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card.Root>

            <div className="flex gap-3">
              <Button onClick={handleManageSubscription} disabled={loading} className="flex-1">
                {loading ? 'Loading...' : hasActiveSubscription ? 'Cancel Subscription' : 'Resume Subscription'}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground">No subscription found</p>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
