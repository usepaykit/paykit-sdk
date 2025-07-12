'use client';

import { useState } from 'react';
import { Button, Card, Input, Badge } from '@paykit-sdk/ui';
import { useSubscription } from '@paykit-sdk/react';
import { CreditCard, Edit3, XCircle, Loader2, Calendar } from 'lucide-react';

export function SubscriptionManager() {
  const [subscriptionId, setSubscriptionId] = useState('');
  const [updateForm, setUpdateForm] = useState({
    priceId: '',
    quantity: 1,
  });
  const { retrieve, update, cancel } = useSubscription();

  const handleRetrieve = async () => {
    if (!subscriptionId) return;
    await retrieve.run(subscriptionId);
  };

  const handleUpdate = async () => {
    if (!subscriptionId || !updateForm.priceId) return;
    await update.run(subscriptionId, updateForm);
  };

  const handleCancel = async () => {
    if (!subscriptionId) return;
    await cancel.run(subscriptionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Subscription Management</h2>
      </div>

      <div className="space-y-6">
        {/* Retrieve Subscription */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">Retrieve Subscription</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Subscription ID"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleRetrieve} disabled={retrieve.loading || !subscriptionId}>
              {retrieve.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retrieve'}
            </Button>
          </div>
          
          {retrieve.data && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Subscription Details</span>
                <Badge variant={retrieve.data.status === 'active' ? 'default' : 'secondary'}>
                  {retrieve.data.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{retrieve.data.customer_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <p className="font-medium">${retrieve.data.price || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <p className="font-medium">{retrieve.data.quantity || 1}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Interval:</span>
                  <p className="font-medium">{retrieve.data.interval || 'monthly'}</p>
                </div>
              </div>

              {retrieve.data.current_period_end && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next billing:</span>
                  <span className="font-medium">{formatDate(retrieve.data.current_period_end)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Update Subscription */}
        {retrieve.data && retrieve.data.status === 'active' && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Update Subscription</h3>
            <div className="space-y-3 p-4 border rounded-lg">
              <Input
                placeholder="New Price ID"
                value={updateForm.priceId}
                onChange={(e) => setUpdateForm({ ...updateForm, priceId: e.target.value })}
              />
              <Input
                placeholder="Quantity"
                type="number"
                min="1"
                value={updateForm.quantity}
                onChange={(e) => setUpdateForm({ ...updateForm, quantity: parseInt(e.target.value) || 1 })}
              />
              <Button 
                onClick={handleUpdate} 
                disabled={update.loading || !updateForm.priceId}
                variant="outline"
                className="w-full"
              >
                {update.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                Update Subscription
              </Button>
            </div>
          </div>
        )}

        {/* Cancel Subscription */}
        {retrieve.data && retrieve.data.status === 'active' && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Cancel Subscription</h3>
            <div className="p-4 border border-destructive/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                This will cancel the subscription at the end of the current billing period.
              </p>
              <Button 
                onClick={handleCancel} 
                disabled={cancel.loading}
                variant="destructive"
                className="w-full"
              >
                {cancel.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                Cancel Subscription
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(retrieve.error || update.error || cancel.error) && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              {retrieve.error?.message || update.error?.message || cancel.error?.message}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 