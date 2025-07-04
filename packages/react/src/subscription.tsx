import * as React from 'react';
import { UpdateSubscriptionParams } from '@paykit-sdk/core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePaykitContext } from './paykit';

export const useSubscription = ({ subscriptionId }: { subscriptionId: string }) => {
  const { provider } = usePaykitContext();

  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['paykit', 'subscription', subscriptionId],
    queryFn: () => provider.retrieveSubscription(subscriptionId),
    enabled: !!subscriptionId,
  });

  const {
    mutateAsync: updateSubscription,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: (params: UpdateSubscriptionParams) => provider.updateSubscription(subscriptionId, params),
  });

  const {
    mutateAsync: cancelSubscription,
    isPending: isCancelling,
    error: cancelError,
  } = useMutation({
    mutationFn: () => provider.cancelSubscription(subscriptionId),
  });

  return {
    subscription,
    isLoading,
    error,
    update: { mutate: updateSubscription, isLoading: isUpdating, error: updateError },
    cancel: { mutate: cancelSubscription, isLoading: isCancelling, error: cancelError },
  };
};
