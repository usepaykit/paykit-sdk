'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaykitMetadata } from '@paykit-sdk/core';
import { useSubscription } from '@paykit-sdk/react';
import { Button, Card, Input, Badge } from '@paykit-sdk/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Edit3, XCircle, Loader2, Calendar, Plus, Trash2 } from 'lucide-react';
import * as RHF from 'react-hook-form';
import { z } from 'zod';

const updateSubscriptionSchema = z.object({
  metadata: z.array(z.object({ key: z.string().min(1, 'Key is required'), value: z.string().min(1, 'Value is required') })).optional(),
});

type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>;

export const SubscriptionManager = () => {
  const { retrieve, update, cancel } = useSubscription();
  const [subscriptionId, setSubscriptionId] = useState('');
  const queryClient = useQueryClient();

  const form = RHF.useForm<UpdateSubscriptionFormData>({ resolver: zodResolver(updateSubscriptionSchema), defaultValues: { metadata: [] } });

  const { fields, append, remove } = RHF.useFieldArray({ control: form.control, name: 'metadata' });

  const {
    data: subscription,
    isLoading: isRetrieving,
    error: retrieveError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: () => retrieve.run(subscriptionId).then(result => result.data),
    enabled: !!subscriptionId,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ subscriptionId, data }: { subscriptionId: string; data: UpdateSubscriptionFormData }) => {
      const metadata =
        data.metadata?.reduce((acc, { key, value }) => {
          acc[key] = value;
          return acc;
        }, {} as PaykitMetadata) || {};

      const response = await update.run(subscriptionId, { metadata });

      if (response.error) throw new Error(response.error.message);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
      form.reset({ metadata: [] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await cancel.run(subscriptionId);

      if (response.error) throw new Error(response.error.message);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', subscriptionId] });
    },
  });

  const handleRetrieve = () => {
    if (!subscriptionId) return;
    refetchSubscription();
  };

  const handleUpdate = form.handleSubmit(data => {
    if (!subscriptionId) return;
    updateMutation.mutate({ subscriptionId, data: data as UpdateSubscriptionFormData });
  });

  const handleCancel = () => {
    if (!subscriptionId) return;
    cancelMutation.mutate(subscriptionId);
  };

  const addMetadataField = () => {
    append({ key: '', value: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Card.Root className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <CreditCard className="text-primary h-5 w-5" />
        <h2 className="text-xl font-semibold">Subscription Management</h2>
      </div>

      <div className="space-y-6">
        {/* Retrieve Subscription */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium">Retrieve Subscription</h3>
          <div className="flex gap-2">
            <Input placeholder="Subscription ID" value={subscriptionId} onChange={e => setSubscriptionId(e.target.value)} className="flex-1" />
            <Button onClick={handleRetrieve} disabled={isRetrieving || !subscriptionId}>
              {isRetrieving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retrieve'}
            </Button>
          </div>

          {subscription && (
            <div className="bg-muted space-y-3 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Subscription Details</span>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>{subscription.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{subscription.customer_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium">{subscription.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <p className="font-medium">{formatDate(subscription.current_period_start.toString())}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <p className="font-medium">{formatDate(subscription.current_period_end.toString())}</p>
                </div>
              </div>

              {subscription.current_period_end && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Next billing:</span>
                  <span className="font-medium">{formatDate(subscription.current_period_end.toString())}</span>
                </div>
              )}

              {/* Display existing metadata */}
              {subscription.metadata && Object.keys(subscription.metadata).length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium">Current Metadata:</h4>
                  <div className="space-y-1">
                    {Object.entries(subscription.metadata).map(([key, value]) => (
                      <div key={key} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Update Subscription */}
        {subscription && subscription.status === 'active' && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium">Update Subscription Metadata</h3>
            <form onSubmit={handleUpdate} className="space-y-4 rounded-lg border p-4">
              {/* Dynamic metadata fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Metadata</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addMetadataField} className="h-8">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-muted-foreground text-sm">No metadata fields added yet. Click "Add Field" to add key-value pairs.</p>
                )}

                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <RHF.Controller
                        name={`metadata.${index}.key`}
                        control={form.control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Input placeholder="Key" {...field} className={error ? 'border-destructive' : ''} />
                            {error && <p className="text-destructive mt-1 text-xs">{error.message}</p>}
                          </div>
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <RHF.Controller
                        name={`metadata.${index}.value`}
                        control={form.control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Input placeholder="Value" {...field} className={error ? 'border-destructive' : ''} />
                            {error && <p className="text-destructive mt-1 text-xs">{error.message}</p>}
                          </div>
                        )}
                      />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} className="h-10 px-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={updateMutation.isPending || fields.length === 0} variant="outline" className="w-full">
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit3 className="mr-2 h-4 w-4" />}
                Update Subscription
              </Button>
            </form>
          </div>
        )}

        {/* Cancel Subscription */}
        {subscription && subscription.status === 'active' && (
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium">Cancel Subscription</h3>
            <div className="border-destructive/20 rounded-lg border p-4">
              <p className="text-muted-foreground mb-3 text-sm">This will cancel the subscription at the end of the current billing period.</p>
              <Button onClick={handleCancel} disabled={cancelMutation.isPending} variant="destructive" className="w-full">
                {cancelMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Cancel Subscription
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(retrieveError || updateMutation.error || cancelMutation.error) && (
          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
            <p className="text-destructive text-sm">{retrieveError?.message || updateMutation.error?.message || cancelMutation.error?.message}</p>
          </div>
        )}
      </div>
    </Card.Root>
  );
};
